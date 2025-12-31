'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Target, Brain, Zap,
    ArrowRight, Rocket, ClipboardCheck,
    CheckCircle2, Star, Cpu, Briefcase
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { aiService } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/use-toast';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const { success, error: toastError, info } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preferences, setPreferences] = useState({
        interests: [] as string[],
        values: [] as string[],
        primary_goal: ""
    });
    const [recommendations, setRecommendations] = useState<any[]>([]);

    const totalSteps = 4;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        if (step === 3) handleGenerateRecommendations();
    };

    const toggleSelection = (category: 'interests' | 'values', item: string) => {
        const current = preferences[category];
        if (current.includes(item)) {
            setPreferences({ ...preferences, [category]: current.filter(i => i !== item) });
        } else {
            setPreferences({ ...preferences, [category]: [...current, item] });
        }
    };

    const handleGenerateRecommendations = async () => {
        setIsSubmitting(true);
        try {
            const res = await aiService.matchCareers({
                skills: [], // New users might not have skills yet
                interests: preferences.interests,
                experience_level: "Initial"
            });
            // The backend returns a list directly, not { matches: [] }
            setRecommendations(Array.isArray(res) ? res : (res.matches || []));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            const updatedUser = await aiService.completeOnboarding(preferences);
            setUser(updatedUser); // Update local store
            success("Onboarding complete! Welcome to your new career path.");
            router.push('/dashboard');
        } catch (err) {
            toastError("Failed to synchronize profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#f8fafc] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>System Activation: Welcome {user?.name}</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Let's map your <span className="text-primary italic">Trajectory.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium">
                            To provide accurate guidance, we need to synchronize with your core professional interests.
                        </p>
                    </div>

                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CleanCard padding="none" className="bg-white border-slate-200 shadow-2xl flex flex-col">
                                    <div className="p-8 md:p-12 flex-1 overflow-y-auto max-h-[70vh]">
                                        {step === 1 && (
                                            <div className="space-y-8">
                                                <OnboardingHeader
                                                    icon={<Brain className="w-6 h-6 text-blue-600" />}
                                                    title="Strategic Interests"
                                                    subtitle="What domains excite you most?"
                                                />
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {["Artificial Intelligence", "Cybersecurity", "Fintech", "HealthTech", "E-commerce", "Green Energy", "SaaS", "Content Creation", "Data Science", "Mobile Apps", "Game Dev", "BioTech"].map(domain => (
                                                        <SelectionButton
                                                            key={domain}
                                                            label={domain}
                                                            selected={preferences.interests.includes(domain)}
                                                            onClick={() => toggleSelection('interests', domain)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-8">
                                                <OnboardingHeader
                                                    icon={<Target className="w-6 h-6 text-violet-600" />}
                                                    title="Core Mandates"
                                                    subtitle="What do you value in your career?"
                                                />
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {["Innovation", "Stability", "Compensation", "Social Impact", "Work-Life Balance", "Rapid Growth", "Autonomy", "Prestige", "Mentorship"].map(value => (
                                                        <SelectionButton
                                                            key={value}
                                                            label={value}
                                                            selected={preferences.values.includes(value)}
                                                            onClick={() => toggleSelection('values', value)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-8">
                                                <OnboardingHeader
                                                    icon={<Rocket className="w-6 h-6 text-rose-600" />}
                                                    title="Primary Directive"
                                                    subtitle="What is your immediate focus?"
                                                />
                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        { id: "Switching Careers", desc: "Finding a completely new professional path" },
                                                        { id: "Skill Mastery", desc: "Deepening competence in my current field" },
                                                        { id: "Leadership Track", desc: "Moving into strategic management roles" },
                                                        { id: "Job Seek", desc: "Optimizing for immediate employment" }
                                                    ].map(goal => (
                                                        <button
                                                            key={goal.id}
                                                            onClick={() => setPreferences({ ...preferences, primary_goal: goal.id })}
                                                            className={cn(
                                                                "p-6 text-left rounded-2xl border transition-all flex items-center justify-between group",
                                                                preferences.primary_goal === goal.id ? "bg-blue-50 border-blue-400" : "bg-white border-slate-100 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <div>
                                                                <div className="font-bold text-slate-900">{goal.id}</div>
                                                                <div className="text-xs text-slate-400 font-medium">{goal.desc}</div>
                                                            </div>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full border flex items-center justify-center transition-all",
                                                                preferences.primary_goal === goal.id ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200"
                                                            )}>
                                                                {preferences.primary_goal === goal.id && <CheckCircle2 className="w-4 h-4" />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-8">
                                                <OnboardingHeader
                                                    icon={<Briefcase className="w-6 h-6 text-amber-600" />}
                                                    title="Initial Recommendations"
                                                    subtitle="AI suggested career paths for you"
                                                />
                                                {isSubmitting ? (
                                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                        <Cpu className="w-12 h-12 text-blue-500 animate-spin" />
                                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synthesizing Options...</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                key={idx}
                                                                className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                                                            >
                                                                <div>
                                                                    <div className="text-lg font-bold text-slate-900">{rec.title || rec.career_path}</div>
                                                                    <div className="text-xs text-blue-600 font-bold uppercase tracking-widest">{rec.match_percentage || rec.match_score || "85"}% Match Integrity</div>
                                                                </div>
                                                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                                            </motion.div>
                                                        )) : (
                                                            <div className="text-center py-12 text-slate-400 font-medium">
                                                                No specific recommendations found. We'll start with a general path.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4].map(s => (
                                                <div key={s} className={cn("w-8 h-1.5 rounded-full transition-all", s === step ? "bg-primary w-12" : s < step ? "bg-blue-200" : "bg-slate-200")} />
                                            ))}
                                        </div>
                                        {step < totalSteps ? (
                                            <button
                                                onClick={nextStep}
                                                disabled={step === 1 && preferences.interests.length === 0 || step === 2 && preferences.values.length === 0 || step === 3 && !preferences.primary_goal}
                                                className="px-8 py-4 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                                            >
                                                Initialize Next Phase <ArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => router.push('/assessment')}
                                                    className="px-8 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                                                >
                                                    Take Skills Assessment
                                                </button>
                                                <button
                                                    onClick={handleFinish}
                                                    disabled={isSubmitting}
                                                    className="px-10 py-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50"
                                                >
                                                    Launch Dashboard <Rocket className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </CleanCard>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}

function OnboardingHeader({ icon, title, subtitle }: { icon: React.ReactNode, title: string, subtitle: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );
}

function SelectionButton({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-5 py-3 rounded-xl border text-xs font-bold transition-all",
                selected
                    ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-900'
            )}
        >
            {label}
        </button>
    );
}
