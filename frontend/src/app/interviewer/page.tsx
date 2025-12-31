'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Sparkles, Trophy, Video, RefreshCw,
    Target, CheckCircle2, Brain, TrendingUp,
    MessageSquare, Award, Zap, ArrowRight, Star
} from 'lucide-react';

import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { useToast } from '@/store/use-toast';
import { aiService } from '@/lib/services';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

interface InterviewMessage {
    role: 'user' | 'ai';
    content: string;
    evaluation?: {
        score: number;
        strengths: string[];
        improvements: string[];
        sample_better_answer?: string;
    };
}

export default function InterviewerPage() {
    const { user } = useAuthStore();
    const { success, error: toastError } = useToast();

    const [sessionStarted, setSessionStarted] = useState(false);
    const [jobTitle, setJobTitle] = useState("");
    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isInterviewComplete, setIsInterviewComplete] = useState(false);
    const [latestAssessment, setLatestAssessment] = useState<any>(null);
    const feedbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAssessment = async () => {
            try {
                const data = await aiService.getLatestAssessment();
                setLatestAssessment(data);
                if (data?.recommended_roles?.[0]?.title) {
                    setJobTitle(data.recommended_roles[0].title);
                }
            } catch (err) {
                console.error("Failed to load assessment for interviewer:", err);
            }
        };
        loadAssessment();
    }, []);

    useEffect(() => {
        if (feedbackRef.current) {
            feedbackRef.current.scrollTop = feedbackRef.current.scrollHeight;
        }
    }, [messages]);

    const startInterview = async () => {
        if (!jobTitle.trim()) {
            toastError("Please enter a job title");
            return;
        }

        setIsLoading(true);
        try {
            const data = await aiService.generateInterviewQuestions({
                job_title: jobTitle,
                difficulty: 'expert',
                count: 5
            });

            setQuestions(data.questions);
            setSessionStarted(true);
            setMessages([]);
            setCurrentQuestionIndex(0);
            setIsInterviewComplete(false);
        } catch (err) {
            toastError("Failed to start interview session");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        const userResponse = input;
        setInput("");
        setIsLoading(true);

        try {
            const evaluation = await aiService.evaluateInterviewAnswer({
                question: questions[currentQuestionIndex].question,
                answer: userResponse,
                job_title: jobTitle
            });

            console.log('AI Evaluation Response:', evaluation);

            // Handle the case where API returns error with raw JSON string
            let parsedEvaluation = evaluation;
            if (evaluation.error && evaluation.raw) {
                try {
                    // The raw field is already a valid JSON string, just parse it
                    parsedEvaluation = JSON.parse(evaluation.raw);
                    console.log('Parsed from raw:', parsedEvaluation);
                } catch (parseErr) {
                    console.error('Failed to parse raw response:', parseErr);
                    console.error('Raw content:', evaluation.raw);
                    // Use the evaluation as-is if parsing fails
                    parsedEvaluation = evaluation;
                }
            }

            const aiFeedback: InterviewMessage = {
                role: 'ai',
                content: parsedEvaluation.feedback || parsedEvaluation.overall_feedback || 'No feedback provided',
                evaluation: {
                    score: parsedEvaluation.score ?? 0,
                    strengths: parsedEvaluation.strengths || [],
                    improvements: parsedEvaluation.improvements || parsedEvaluation.areas_for_improvement || [],
                    sample_better_answer: parsedEvaluation.sample_better_answer || parsedEvaluation.sample_answer || ''
                }
            };

            console.log('Processed Feedback:', aiFeedback);

            setMessages(prev => [...prev, aiFeedback]);

            // Move to next question or end interview
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // Interview complete
                setIsInterviewComplete(true);
                saveSession();
            }
        } catch (err) {
            console.error('Evaluation error:', err);
            toastError("Failed to evaluate answer");
        } finally {
            setIsLoading(false);
        }
    };

    const saveSession = async () => {
        if (!user || isSaving) return;
        setIsSaving(true);
        try {
            await api.post('/saved-runs/', {
                title: `Interview - ${jobTitle} - ${new Date().toLocaleDateString()}`,
                content: JSON.stringify(messages),
                run_type: 'interview_sim'
            });
            success('Interview session saved successfully');
        } catch (err) {
            console.error('Failed to save session:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const restartInterview = () => {
        setSessionStarted(false);
        setMessages([]);
        setCurrentQuestionIndex(0);
        setInput("");
        setJobTitle("");
        setQuestions([]);
        setIsInterviewComplete(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'from-green-50 to-emerald-50 border-green-200 text-green-700';
        if (score >= 6) return 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700';
        if (score >= 4) return 'from-orange-50 to-amber-50 border-orange-200 text-orange-700';
        return 'from-red-50 to-rose-50 border-red-200 text-red-700';
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-20 md:pt-28 pb-40 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">

                    {!sessionStarted ? (
                        // ==================== SETUP SCREEN ====================
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-10"
                        >
                            {/* Hero Section */}
                            <div className="text-center space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30"
                                >
                                    <Video className="w-4 h-4" />
                                    <span>AI-Powered Interview Practice</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight"
                                >
                                    Ace Your Next
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Interview
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="max-w-2xl mx-auto text-slate-600 text-base md:text-lg font-medium leading-relaxed"
                                >
                                    Practice with our AI interviewer, get instant feedback, and improve your performance with personalized insights.
                                </motion.p>
                            </div>

                            {/* Main Setup Card & Briefing */}
                            <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8">
                                {/* Setup Form */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="lg:col-span-7"
                                >
                                    <CleanCard padding="none" className="bg-white border-2 border-slate-200 shadow-2xl overflow-hidden h-full">
                                        {/* Card Header */}
                                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-200">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                                                    <Target className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1">Start Your Practice</h2>
                                                    <p className="text-base text-slate-600 font-medium">Enter your target role and begin</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 space-y-6">
                                            <div>
                                                <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-4">
                                                    🎯 Target Job Title
                                                </label>
                                                <div className="space-y-4">
                                                    <input
                                                        type="text"
                                                        value={jobTitle}
                                                        onChange={(e) => setJobTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && startInterview()}
                                                        placeholder="e.g. Senior Software Engineer"
                                                        className="w-full h-14 bg-slate-50 border-2 border-slate-200 px-6 rounded-2xl text-base font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                                    />

                                                    {latestAssessment?.recommended_roles && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {latestAssessment.recommended_roles.slice(0, 3).map((role: any) => (
                                                                <button
                                                                    key={role.title}
                                                                    onClick={() => setJobTitle(role.title)}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                                                                        jobTitle === role.title
                                                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                                            : "bg-blue-50 border-blue-100 text-blue-700 hover:border-blue-400"
                                                                    )}
                                                                >
                                                                    {role.title}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={startInterview}
                                                disabled={isLoading || !jobTitle.trim()}
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isLoading ? (
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <><Sparkles className="w-5 h-5" /> Begin Interview</>
                                                )}
                                            </button>
                                        </div>
                                    </CleanCard>
                                </motion.div>

                                {/* Strategic Briefing Column */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="lg:col-span-5"
                                >
                                    <CleanCard padding="p-8" className="bg-gradient-to-br from-slate-900 to-slate-800 border-none shadow-2xl h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                                                <Brain className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-white">Strategic Briefing</h3>
                                                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Context-Aware Prep</div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Leverage Strengths</div>
                                                <div className="space-y-3">
                                                    {(latestAssessment?.strengths || ["Analytical Thinking", "Communication", "Problem Solving"]).slice(0, 3).map((s: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group hover:bg-white/10 transition-all">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-300">{s}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Interview Edge</span>
                                                </div>
                                                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                                    {latestAssessment
                                                        ? `Focus on demonstrating your ${latestAssessment.strengths?.[0]} with concrete examples from your professional history to align with the ${jobTitle || 'target'} role.`
                                                        : "Complete your carrier assessment to unlock tactical interview strategies and role-specific talking points."}
                                                </p>
                                            </div>
                                        </div>
                                    </CleanCard>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : (
                        // ==================== INTERVIEW SESSION SCREEN ====================
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Progress Header */}
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                        <div>
                                            <h2 className="text-xl font-black text-white">Interview Active</h2>
                                            <p className="text-xs font-bold text-blue-100">{jobTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                                        <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Progress</p>
                                        <p className="text-2xl font-black text-white">
                                            {currentQuestionIndex + 1}
                                            <span className="text-base text-blue-200 mx-1">/</span>
                                            {questions.length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Question Section */}
                            {!isInterviewComplete && (
                                <CleanCard padding="p-6" className="bg-white border-2 border-slate-200 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <MessageSquare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Question {currentQuestionIndex + 1}</h3>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Read carefully and take your time</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                                        <p className="text-base font-bold text-slate-900 leading-relaxed">
                                            {questions[currentQuestionIndex]?.question}
                                        </p>
                                    </div>
                                </CleanCard>
                            )}

                            {/* Answer Section */}
                            {!isInterviewComplete && (
                                <CleanCard padding="p-6" className="bg-white border-2 border-slate-200 shadow-xl">
                                    <label className="block text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="text-xl">✍️</span>
                                        Your Answer
                                    </label>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Type your comprehensive answer here... (Ctrl+Enter to submit)"
                                        disabled={isLoading || isInterviewComplete}
                                        className="w-full h-32 bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading || isInterviewComplete}
                                        className="mt-3 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="w-6 h-6 animate-spin" />
                                                AI is Evaluating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-6 h-6" />
                                                Submit Answer
                                                <ArrowRight className="w-6 h-6" />
                                            </>
                                        )}
                                    </button>
                                </CleanCard>
                            )}

                            {/* Feedback Section */}
                            {messages.length > 0 && (
                                <CleanCard padding="p-6" className="bg-white border-2 border-slate-200 shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                            <Brain className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">AI Evaluation</h3>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Detailed feedback on your response</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4">
                                        {messages.filter(m => m.role === 'ai').map((m, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-5 pb-6 border-b-2 border-slate-100 last:border-0"
                                            >
                                                {m.evaluation && (
                                                    <>
                                                        {/* Score Card */}
                                                        <div className={cn(
                                                            "p-5 rounded-2xl bg-gradient-to-r border-2 flex items-center justify-between",
                                                            getScoreColor(m.evaluation.score)
                                                        )}>
                                                            <div className="flex items-center gap-2">
                                                                <Trophy className="w-6 h-6" />
                                                                <div>
                                                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Performance Score</p>
                                                                    <p className="text-sm font-bold mt-1">Question {i + 1}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-2xl font-black">
                                                                {m.evaluation?.score ?? 'N/A'}
                                                                <span className="text-lg opacity-50">/10</span>
                                                            </div>
                                                        </div>

                                                        {/* Detailed Feedback */}
                                                        <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <span className="text-xl">💬</span>
                                                                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider">Detailed Feedback</h4>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                                {m.content}
                                                            </p>
                                                        </div>

                                                        {/* Strengths */}
                                                        {m.evaluation.strengths.length > 0 && (
                                                            <div className="p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                                                                <div className="flex items-center gap-2 mb-5">
                                                                    <Sparkles className="w-5 h-5 text-green-600" />
                                                                    <h4 className="text-sm font-black text-green-700 uppercase tracking-wider">What You Did Well</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {m.evaluation.strengths.map((s, idx) => (
                                                                        <div key={idx} className="flex items-start gap-4">
                                                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                                                                            <span className="text-base font-medium text-green-900 leading-relaxed">{s}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Improvements */}
                                                        {m.evaluation.improvements.length > 0 && (
                                                            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
                                                                <div className="flex items-center gap-2 mb-5">
                                                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                                                    <h4 className="text-sm font-black text-orange-700 uppercase tracking-wider">Areas to Improve</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {m.evaluation.improvements.map((imp, idx) => (
                                                                        <div key={idx} className="flex items-start gap-4">
                                                                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0" />
                                                                            <span className="text-base font-medium text-orange-900 leading-relaxed">{imp}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Sample Answer */}
                                                        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
                                                            <div className="flex items-center gap-2 mb-5">
                                                                <span className="text-xl">💡</span>
                                                                <h4 className="text-sm font-black text-indigo-700 uppercase tracking-wider">Ideal Answer Example</h4>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900 leading-relaxed whitespace-pre-wrap">
                                                                {m.evaluation.sample_better_answer || "A strong answer would demonstrate specific examples, quantify your achievements, and align your experience with the role requirements."}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </CleanCard>
                            )}

                            {/* Completion Card */}
                            {isInterviewComplete && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <CleanCard padding="p-8" className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                                        <div className="text-center mb-6">
                                            <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                            <h3 className="text-3xl font-black text-slate-900 mb-3">Interview Complete! 🎉</h3>
                                            <p className="text-base font-medium text-slate-700 max-w-2xl mx-auto">
                                                Excellent work! You've completed all {questions.length} questions for the <span className="font-bold text-blue-600">{jobTitle}</span> role.
                                            </p>
                                        </div>

                                        {/* Overall Performance Score */}
                                        {(() => {
                                            const scores = messages.filter(m => m.role === 'ai' && m.evaluation?.score).map(m => m.evaluation!.score);
                                            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                                            const allStrengths = messages.filter(m => m.role === 'ai' && m.evaluation?.strengths).flatMap(m => m.evaluation!.strengths);
                                            const allImprovements = messages.filter(m => m.role === 'ai' && m.evaluation?.improvements).flatMap(m => m.evaluation!.improvements);

                                            const performanceLevel = avgScore >= 8 ? 'Excellent' : avgScore >= 6 ? 'Good' : avgScore >= 4 ? 'Fair' : 'Needs Improvement';
                                            const performanceColor = avgScore >= 8 ? 'text-green-600' : avgScore >= 6 ? 'text-blue-600' : avgScore >= 4 ? 'text-orange-600' : 'text-red-600';

                                            return (
                                                <>
                                                    {/* Overall Score Card */}
                                                    <div className="mb-6 p-6 bg-white rounded-2xl border-2 border-green-200 shadow-lg">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Overall Performance</p>
                                                                <p className={`text-xl font-black ${performanceColor} mt-1`}>{performanceLevel}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-5xl font-black text-blue-600">{avgScore}</p>
                                                                <p className="text-lg font-bold text-slate-500">/10</p>
                                                            </div>
                                                        </div>

                                                        {/* Stats Grid */}
                                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                                                            <div className="text-center">
                                                                <p className="text-2xl font-black text-blue-600">{questions.length}</p>
                                                                <p className="text-xs font-medium text-slate-600">Questions</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-black text-green-600">{allStrengths.length}</p>
                                                                <p className="text-xs font-medium text-slate-600">Strengths</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-2xl font-black text-orange-600">{allImprovements.length}</p>
                                                                <p className="text-xs font-medium text-slate-600">Areas to Improve</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* General Feedback */}
                                                    <div className="mb-6 p-6 bg-white rounded-2xl border-2 border-blue-200">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Brain className="w-5 h-5 text-blue-600" />
                                                            <h4 className="text-base font-black text-slate-900 uppercase tracking-wider">General Feedback</h4>
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                                            {avgScore >= 8
                                                                ? `Outstanding performance! You demonstrated strong expertise and excellent communication skills throughout the interview. Your answers were well-structured, detailed, and showed deep understanding of the ${jobTitle} role. Continue building on your strengths while addressing the minor improvement areas noted below.`
                                                                : avgScore >= 6
                                                                    ? `Good performance overall! You showed solid understanding and provided relevant examples. Your answers demonstrated competence in key areas for the ${jobTitle} role. Focus on the improvement areas below to elevate your interview performance to the next level.`
                                                                    : avgScore >= 4
                                                                        ? `Fair performance with room for growth. You have foundational knowledge but need to develop more depth and provide more specific examples. Review the improvement areas carefully and practice structuring your answers using the STAR method (Situation, Task, Action, Result).`
                                                                        : `Your interview needs significant improvement. Focus on understanding the core requirements of the ${jobTitle} role and practice answering common interview questions. Review the detailed feedback for each question and work on the improvement areas listed below.`
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Key Areas for Improvement */}
                                                    {allImprovements.length > 0 && (
                                                        <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                                                <h4 className="text-base font-black text-orange-700 uppercase tracking-wider">Key Areas for Improvement</h4>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {allImprovements.slice(0, 5).map((improvement, idx) => (
                                                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200">
                                                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                            <span className="text-xs font-black text-orange-600">{idx + 1}</span>
                                                                        </div>
                                                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{improvement}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Next Steps */}
                                                    <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Target className="w-5 h-5 text-indigo-600" />
                                                            <h4 className="text-base font-black text-indigo-700 uppercase tracking-wider">Next Steps</h4>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            <li className="flex items-start gap-3">
                                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                                                <span className="text-sm font-medium text-slate-700">Review all feedback above and note patterns in your strengths and weaknesses</span>
                                                            </li>
                                                            <li className="flex items-start gap-3">
                                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                                                <span className="text-sm font-medium text-slate-700">Practice answering similar questions using the sample answers as templates</span>
                                                            </li>
                                                            <li className="flex items-start gap-3">
                                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                                                <span className="text-sm font-medium text-slate-700">Focus on addressing the top improvement areas in your next practice session</span>
                                                            </li>
                                                            <li className="flex items-start gap-3">
                                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                                                                <span className="text-sm font-medium text-slate-700">Take another interview to track your progress and improvement</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </>
                                            );
                                        })()}

                                        {/* Restart Button */}
                                        <div className="flex gap-4 justify-center pt-4">
                                            <button
                                                type="button"
                                                onClick={restartInterview}
                                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Start New Interview
                                            </button>
                                        </div>
                                    </CleanCard>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
