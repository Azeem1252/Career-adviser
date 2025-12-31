'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Sparkles, Target,
    Brain, Zap, ShieldCheck, Cpu, Star,
    ArrowRight, Rocket, ClipboardCheck, CheckCircle2
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { aiService } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/use-toast';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

interface AssessmentData {
    skills: string[];
    interests: string[];
    values: string[];
    background: string;
    work_style: string;
    ambition: string;
}

export default function AssessmentPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { success, error: toastError, info } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<AssessmentData>({
        skills: [],
        interests: [],
        values: [],
        background: "",
        work_style: "",
        ambition: ""
    });
    const [assessmentId, setAssessmentId] = useState<number | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await aiService.startAssessment();
                setAssessmentId(res.assessment_id);
            } catch (err) {
                console.error("Assessment initialization failed:", err);
            }
        };
        init();
    }, []);

    const totalSteps = 6;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleSelection = (category: keyof AssessmentData, item: string) => {
        const current = formData[category] as string[];
        if (current.includes(item)) {
            setFormData({ ...formData, [category]: current.filter(i => i !== item) });
        } else {
            setFormData({ ...formData, [category]: [...current, item] });
        }
    };

    const handleFinalSubmit = async () => {
        if (!assessmentId) return toastError("Assessment protocol not initialized.");
        setIsSubmitting(true);
        info("Synthesizing your career profile...");
        try {
            await aiService.submitAssessment(assessmentId, formData);
            success("Profile alignment complete. Generating recommendations.");
            router.push(`/careers`);
        } catch (err) {
            console.error(err);
            toastError("Connection failure during synchronization.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#f8fafc] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                            <ClipboardCheck className="w-4 h-4" />
                            <span>System Protocol: Career Alignment v4.0</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
                            Career <span className="text-primary italic">Alignment</span>
                        </h1>
                        <p className="max-w-xl text-slate-500 text-lg font-medium leading-relaxed">
                            Initialize your professional diagnostic. We'll synchronize your skills and values to map your ideal trajectory.
                        </p>
                    </div>

                    {/* Progress Monitor */}
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Step {step} of {totalSteps}</div>
                                <div className="text-sm font-bold text-slate-900">
                                    {step === 1 && "Technical Arsenal"}
                                    {step === 2 && "Intellectual Interests"}
                                    {step === 3 && "Core Mandates"}
                                    {step === 4 && "Career Trajectory"}
                                    {step === 5 && "Operational Style"}
                                    {step === 6 && "Final Directive"}
                                </div>
                            </div>
                            <div className="text-xl font-bold text-primary">{Math.round((step / totalSteps) * 100)}%</div>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / totalSteps) * 100}%` }}
                                transition={{ type: 'spring', stiffness: 50 }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CleanCard padding="none" className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col">
                                <div className="p-8 md:p-12 flex-1 overflow-y-auto max-h-[65vh]">
                                    {step === 1 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<Cpu className="w-6 h-6 text-blue-600" />}
                                                title="Technical Arsenal"
                                                subtitle="Select your primary strategic capabilities"
                                                colorClass="bg-blue-50"
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {["JavaScript", "Python", "UI/UX", "Product Strategy", "Management", "Marketing", "Data Analysis", "AI/ML", "DevOps", "Sales", "Security", "Operations"].map(s => (
                                                    <SelectionButton
                                                        key={s}
                                                        label={s}
                                                        selected={formData.skills.includes(s)}
                                                        onClick={() => toggleSelection('skills', s)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<Brain className="w-6 h-6 text-indigo-600" />}
                                                title="Intellectual Interests"
                                                subtitle="What domains ignite your curiosity?"
                                                colorClass="bg-indigo-50"
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {["Technology", "Finance", "Healthcare", "Aviation", "Education", "E-commerce", "Sustainability", "Creativity", "Social Impact", "Space Tech", "Entertainment", "Auto"].map(s => (
                                                    <SelectionButton
                                                        key={s}
                                                        label={s}
                                                        selected={formData.interests.includes(s)}
                                                        onClick={() => toggleSelection('interests', s)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<ShieldCheck className="w-6 h-6 text-violet-600" />}
                                                title="Core Mandates"
                                                subtitle="The values that anchor your work"
                                                colorClass="bg-violet-50"
                                            />
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {["Work-Life Balance", "High Compensation", "Innovation", "Stability", "Social Good", "Autonomy", "Fast Growth", "Mentorship", "Prestige", "Diversity"].map(s => (
                                                    <SelectionButton
                                                        key={s}
                                                        label={s}
                                                        selected={formData.values.includes(s)}
                                                        onClick={() => toggleSelection('values', s)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<Target className="w-6 h-6 text-rose-600" />}
                                                title="Career Trajectory"
                                                subtitle="Define your professional milestones"
                                                colorClass="bg-rose-50"
                                            />
                                            <textarea
                                                className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-8 text-sm md:text-base font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                                placeholder="Summarize your background, achievements, and professional journey..."
                                                value={formData.background}
                                                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<Zap className="w-6 h-6 text-amber-600" />}
                                                title="Operational Style"
                                                subtitle="Identify your preferred execution environment"
                                                colorClass="bg-amber-50"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { id: "Collaborative Team", desc: "Synergizing with others for mission success" },
                                                    { id: "Independent Contributor", desc: "Autonomous execution and solo deep-work" },
                                                    { id: "Strategic Leader", desc: "Directing squads toward high-level objectives" },
                                                    { id: "Technical Specialist", desc: "Deep precision in niche technical domains" }
                                                ].map(style => (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => setFormData({ ...formData, work_style: style.id })}
                                                        className={cn(
                                                            "p-6 h-auto rounded-2xl border text-left transition-all flex flex-col group",
                                                            formData.work_style === style.id
                                                                ? 'bg-blue-50 border-blue-400 ring-4 ring-blue-500/5'
                                                                : 'bg-white border-slate-100 hover:border-slate-300'
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className={cn("text-sm font-bold", formData.work_style === style.id ? "text-blue-700" : "text-slate-900")}>
                                                                {style.id}
                                                            </div>
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                                formData.work_style === style.id ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200"
                                                            )}>
                                                                {formData.work_style === style.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                            </div>
                                                        </div>
                                                        <p className={cn("text-xs font-medium", formData.work_style === style.id ? "text-blue-600/70" : "text-slate-400")}>
                                                            {style.desc}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="space-y-10">
                                            <StepHeader
                                                icon={<Star className="w-6 h-6 text-primary" />}
                                                title="Final Directive"
                                                subtitle="State your ultimate career ambition"
                                                colorClass="bg-blue-50"
                                            />
                                            <textarea
                                                className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-8 text-sm md:text-base font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
                                                placeholder="Where do you see yourself at the peak of your career?"
                                                value={formData.ambition}
                                                onChange={(e) => setFormData({ ...formData, ambition: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-slate-100 flex justify-between gap-4 bg-slate-50/30">
                                    {step > 1 && (
                                        <button
                                            onClick={prevStep}
                                            className="px-8 py-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                    )}
                                    <div className="flex-1" />
                                    {step < totalSteps ? (
                                        <button
                                            onClick={nextStep}
                                            className="px-10 py-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 flex items-center gap-2 transition-all"
                                        >
                                            Next Question <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleFinalSubmit}
                                            disabled={isSubmitting}
                                            className="px-12 py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:bg-slate-800 flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Processing...' : 'Complete Alignment'} <Rocket className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </CleanCard>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </ProtectedRoute>
    );
}

function StepHeader({ icon, title, subtitle, colorClass }: { icon: React.ReactNode, title: string, subtitle: string, colorClass: string }) {
    return (
        <div className="flex items-center gap-6">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", colorClass)}>
                {icon}
            </div>
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    );
}

function SelectionButton({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-6 py-4 rounded-xl border text-sm font-bold transition-all",
                selected
                    ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-500/5 shadow-sm'
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:text-slate-900'
            )}
        >
            {label}
        </button>
    );
}
