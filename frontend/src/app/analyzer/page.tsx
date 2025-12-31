'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileUp, Search, AlertCircle, CheckCircle2,
    ArrowRight, Sparkles, BrainCircuit, Zap,
    Cpu, Terminal, ShieldCheck, Target, FileText,
    Navigation
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import api from '@/lib/api';
import { useToast } from '@/store/use-toast';
import { aiService } from '@/lib/services';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

export default function ResumeAnalyzerPage() {
    const { user } = useAuthStore();
    const { success, error: toastError } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [analysisActive, setAnalysisActive] = useState(false);
    const [complete, setComplete] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [showJdInput, setShowJdInput] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [latestAssessment, setLatestAssessment] = useState<any>(null);

    React.useEffect(() => {
        const loadAssessment = async () => {
            try {
                // Use a timeout to prevent blocking the page if assessment fetch is slow
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Assessment fetch timeout')), 5000)
                );
                const data = await Promise.race([
                    aiService.getLatestAssessment(),
                    timeoutPromise
                ]);
                setLatestAssessment(data);
            } catch (err) {
                // Silently fail - assessment data is optional for the analyzer
                console.log("Assessment fetch skipped (optional data)");
            }
        };
        loadAssessment();
    }, []);

    const startAnalysis = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.docx,.txt,text/markdown';

        fileInput.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                setIsUploading(true);
                setAnalysisActive(true);
                const result = await aiService.analyzeResume(file, jobDescription);
                setAnalysisResult(result);
                success(jobDescription ? 'Targeted job analysis complete.' : 'Analysis result persisted to your profile.');
                setComplete(true);
            } catch (err: any) {
                console.error('Failed to analyze resume:', err);
                if (err?.response?.status === 429) {
                    toastError('Rate limit exceeded. Please wait a moment.');
                } else if (err?.response?.data?.detail) {
                    toastError(err.response.data.detail);
                } else {
                    toastError('Analysis failure. Please verify file format.');
                }
            } finally {
                setIsUploading(false);
                setAnalysisActive(false);
            }
        };

        fileInput.click();
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--bg)] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-[1280px] mx-auto">

                    {/* Header Section */}
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                            <Target className="w-3 h-3" />
                            <span>System Protocol: Skill Gap Analysis 2.0.4</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
                            Resume <span className="text-primary italic">Analyzer</span>
                        </h1>
                        <p className="max-w-2xl text-slate-500 text-lg font-medium leading-relaxed">
                            Upload your professional identity. Our neural engine will dismantle your profile to identify critical skill gaps and market alignment.
                        </p>
                    </div>

                    {!analysisActive && !complete && (
                        <div className="max-w-4xl mx-auto space-y-12">
                            <CleanCard padding="none" className="overflow-hidden bg-white border-slate-200">
                                <div className="p-10 md:p-20 text-center relative group">
                                    <div
                                        onClick={startAnalysis}
                                        className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all cursor-pointer"
                                    >
                                        <FileUp className={cn("w-12 h-12 md:w-16 md:h-16 text-slate-300 group-hover:text-blue-500 transition-colors", isUploading && "animate-bounce")} />
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                                        {isUploading ? 'Decoding Profile...' : 'Initialize Analysis'}
                                    </h2>
                                    <p className="text-slate-400 mb-12 text-sm font-medium">
                                        PDF, DOCX, or MARKDOWN formats supported. <br className="hidden sm:block" /> Maximum encrypted payload: 10MB.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button
                                            onClick={startAnalysis}
                                            className="w-full sm:w-auto h-[40px] px-6 rounded-lg bg-blue-600 text-white font-semibold text-[14px] shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all duration-[150ms] hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Processing...' : 'Upload Resume'} <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => setShowJdInput(!showJdInput)}
                                            className="w-full sm:w-auto h-[36px] px-4 rounded-lg bg-white border-2 border-slate-300 text-slate-900 font-semibold text-[14px] hover:bg-slate-50 hover:border-slate-400 transition-all duration-[150ms]"
                                        >
                                            {showJdInput ? 'Remove Job Target' : 'Add Job Target'}
                                        </button>
                                    </div>
                                </div>
                            </CleanCard>

                            <AnimatePresence>
                                {showJdInput && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    >
                                        <CleanCard padding="p-6" className="bg-white">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[16px] font-semibold text-slate-900">Strategic Target</h3>
                                                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Optional: Precise Requirement Matching</p>
                                                </div>
                                            </div>
                                            <textarea
                                                value={jobDescription}
                                                onChange={(e) => setJobDescription(e.target.value)}
                                                placeholder="Paste target requirements here for a precision-matched analysis..."
                                                className="w-full h-48 bg-slate-50 border border-[var(--border)] rounded-lg p-4 text-[14px] text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-[150ms] resize-none"
                                            />

                                            {latestAssessment?.recommended_roles && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Recommended Roles</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {latestAssessment.recommended_roles.slice(0, 3).map((role: any) => (
                                                            <button
                                                                key={role.title}
                                                                onClick={() => setJobDescription(`Role: ${role.title}`)}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                                                    jobDescription.includes(role.title)
                                                                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                                        : "bg-blue-50 border-blue-100 text-blue-700 hover:border-blue-300"
                                                                )}
                                                            >
                                                                {role.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </CleanCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {analysisActive && (
                        <div className="text-center py-32">
                            <div className="relative w-48 h-48 mx-auto mb-12">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-4 border-b-2 border-slate-200 rounded-full"
                                />
                                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Executing Decryption...</h2>
                            <div className="max-w-sm mx-auto space-y-4">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: ['0%', '100%'] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                    />
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Professional Fabric</div>
                            </div>
                        </div>
                    )}

                    {complete && analysisResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            {/* Executive Summary */}
                            {analysisResult.executive_summary && (
                                <CleanCard padding="none" className="bg-white overflow-hidden border-slate-200">
                                    <div className="p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                                        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Executive Brief</h3>
                                            <p className="text-xl md:text-2xl font-bold text-slate-800 leading-tight italic">
                                                "{analysisResult.executive_summary}"
                                            </p>
                                        </div>
                                    </div>
                                </CleanCard>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-8 space-y-12">

                                    {/* Neural Score Matrix */}
                                    <CleanCard padding="none" className="bg-white border-slate-200">
                                        <div className="p-8 md:p-10">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Aggregate Integrity</div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Neural Score</h3>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-7xl font-black text-primary tracking-tighter leading-none">
                                                        {analysisResult.overall_score || 0}
                                                    </span>
                                                    <span className="text-2xl font-bold text-slate-300">%</span>
                                                </div>
                                            </div>

                                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-12">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${analysisResult.overall_score || 0}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'ATS Health', val: analysisResult.ats_score || 0, icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-50" },
                                                    { label: 'Technical', val: analysisResult.technical_score || 0, icon: Terminal, color: "text-blue-600", bg: "bg-blue-50" },
                                                    { label: 'Market Fit', val: analysisResult.market_alignment || 0, icon: Cpu, color: "text-indigo-600", bg: "bg-indigo-50" },
                                                    { label: 'Impact', val: analysisResult.impact_score || 0, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
                                                    { label: 'Structure', val: analysisResult.format_score || 0, icon: FileUp, color: "text-violet-600", bg: "bg-violet-50" },
                                                    { label: 'Density', val: analysisResult.keyword_density || 0, icon: Search, color: "text-rose-600", bg: "bg-rose-50" }
                                                ].map((stat, i) => (
                                                    <div key={i} className="p-5 md:p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                                        </div>
                                                        <div className="text-3xl font-extrabold text-slate-900 mb-3">{stat.val}%</div>
                                                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${stat.val}%` }}
                                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                                className={cn("h-full", stat.color.replace('text', 'bg'))}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CleanCard>

                                    {/* Factors Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <CleanCard padding="none" className="bg-white border-slate-200 overflow-hidden">
                                            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                                <h3 className="text-lg font-bold text-slate-900">Key Strengths</h3>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                {analysisResult.strengths?.map((strength: string, i: number) => (
                                                    <div key={i} className="flex gap-4 p-5 rounded-xl bg-blue-50 text-blue-900 text-sm font-semibold border border-blue-100">
                                                        <span className="text-blue-500 shrink-0">0{i + 1}</span>
                                                        {strength}
                                                    </div>
                                                ))}
                                            </div>
                                        </CleanCard>

                                        <CleanCard padding="none" className="bg-white border-slate-200 overflow-hidden">
                                            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-indigo-500" />
                                                <h3 className="text-lg font-bold text-slate-900">Critical Gaps</h3>
                                            </div>
                                            <div className="p-8 space-y-4">
                                                {analysisResult.gaps?.map((gap: string, i: number) => (
                                                    <div key={i} className="flex gap-4 p-5 rounded-xl bg-indigo-50 text-indigo-900 text-sm font-semibold border border-indigo-100">
                                                        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                                                        {gap}
                                                    </div>
                                                ))}
                                            </div>
                                        </CleanCard>
                                    </div>

                                    {/* Keywords Archive */}
                                    <CleanCard padding="none" className="bg-white border-slate-100 overflow-hidden">
                                        <div className="p-10 border-b border-slate-50 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <Search className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Neural Keyword Vector</h3>
                                        </div>
                                        <div className="p-10">
                                            <div className="flex flex-wrap gap-3">
                                                {analysisResult.keyword_optimized?.map((keyword: string, i: number) => (
                                                    <span key={i} className="px-5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all cursor-default">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </CleanCard>
                                </div>

                                {/* Sidebar Action Panel */}
                                <div className="lg:col-span-4">
                                    <div className="sticky top-32 space-y-8">
                                        <CleanCard padding="none" className="bg-white border-slate-200">
                                            <div className="p-8">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <Zap className="w-5 h-5 text-blue-600" />
                                                    <h3 className="text-xl font-bold text-slate-900">Next Actions</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { l: 'Explore Roadmaps', h: '/roadmaps', icon: Navigation },
                                                        { l: 'Interview Practice', h: '/interviewer', icon: BrainCircuit },
                                                        { l: 'Profile Optimizer', h: '/dashboard', icon: Target },
                                                        { l: 'Draft Cover Letter', h: '/cover-letter', icon: FileText }
                                                    ].map((action: any, i) => (
                                                        <Link key={i} href={action.h} className="block group">
                                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-blue-300 transition-colors">
                                                                    <action.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                                                                    {action.l}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setComplete(false)}
                                                    className="w-full mt-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-sm tracking-wider uppercase hover:bg-blue-600 transition-all shadow-lg"
                                                >
                                                    New Analysis
                                                </button>
                                            </div>
                                        </CleanCard>

                                        <div className="p-8 bg-slate-100 rounded-[2.5rem] text-center">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Integrity Disclaimer</h4>
                                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                                                Analysis is generated based on current neural market data. Accuracy may vary based on specific hiring contexts.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main >
        </ProtectedRoute >
    );
}



