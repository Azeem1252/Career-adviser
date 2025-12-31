'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, Briefcase, DollarSign, Clock,
    CheckCircle2, AlertCircle, ArrowRight, Sparkles,
    Target, Award, Zap, ExternalLink
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/store/use-toast';
import api from '@/lib/api';

interface CareerMatch {
    career_title: string;
    match_percentage: number;
    description: string;
    reasons: string[];
    required_skills: string[];
    skill_gaps: string[];
    salary_range: string;
    growth_outlook: string;
    work_life_balance: string;
    day_to_day: string[];
    action_plan: {
        immediate: string[];
        short_term: string[];
        long_term: string[];
    };
}

interface AssessmentResults {
    assessment_id: number;
    career_matches: CareerMatch[];
    overall_clarity_score: number;
    skills_breakdown: any;
    interests_alignment: any;
    values_match: any;
    completed_at: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { success, error: toastError } = useToast();

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<AssessmentResults | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<number>(0);

    useEffect(() => {
        const assessmentId = searchParams.get('id');
        if (!assessmentId) {
            toastError('No assessment ID provided');
            router.push('/assessment');
            return;
        }

        fetchResults(parseInt(assessmentId));
    }, [searchParams]);

    const fetchResults = async (assessmentId: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/assessment/${assessmentId}/results`);
            setResults(response.data);
        } catch (err) {
            console.error('Failed to fetch results:', err);
            toastError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const createRoadmap = async (careerTitle: string) => {
        try {
            await api.post('/roadmaps/generate', {
                current_profile: 'Based on career assessment',
                target_career: careerTitle
            });
            success(`Roadmap created for ${careerTitle}!`);
            router.push('/roadmaps');
        } catch (err) {
            toastError('Failed to create roadmap');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <main className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 mx-auto mb-6"
                        >
                            <Sparkles className="w-full h-full text-primary" />
                        </motion.div>
                        <p className="text-sm font-black uppercase tracking-widest opacity-60">
                            Analyzing Your Career Path...
                        </p>
                    </div>
                </main>
            </ProtectedRoute>
        );
    }

    if (!results) {
        return null;
    }

    const topCareer = results.career_matches[selectedCareer];

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-50/50 pt-20 md:pt-24 pb-12 md:pb-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 mb-6 border border-blue-100">
                            <Award className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Your Results</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
                            Career <span className="text-primary italic">Matches.</span>
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl mx-auto">
                            Based on your assessment, we've identified {results.career_matches.length} careers that align with your skills, interests, and values
                        </p>
                    </motion.div>

                    {/* Overall Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center"
                    >
                        <div className="text-6xl md:text-8xl font-black text-primary mb-2">
                            {results.overall_clarity_score}%
                        </div>
                        <p className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-400">
                            Career Clarity Score
                        </p>
                    </motion.div>

                    {/* Career Matches */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                        {/* Left: Career List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">
                                Top Matches
                            </h2>
                            {results.career_matches.map((career, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedCareer(index)}
                                    className={`w-full p-4 md:p-6 rounded-2xl border transition-all text-left ${selectedCareer === index
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20'
                                        : 'bg-white border-slate-200 hover:border-blue-400/40 text-slate-600'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className={`text-sm md:text-base font-black uppercase tracking-tight flex-1 ${selectedCareer === index ? 'text-white' : 'text-slate-900'}`}>
                                            {career.career_title}
                                        </h3>
                                        <div className={`text-2xl md:text-3xl font-black ${selectedCareer === index ? 'text-white' : 'text-primary'}`}>
                                            {career.match_percentage}%
                                        </div>
                                    </div>
                                    <div className={`h-2 rounded-full overflow-hidden ${selectedCareer === index ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        <div
                                            className={`h-full ${selectedCareer === index ? 'bg-white' : 'bg-primary'}`}
                                            style={{ width: `${career.match_percentage}%` }}
                                        />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Right: Career Details */}
                        <div className="lg:col-span-2">
                            <motion.div
                                key={selectedCareer}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50"
                            >
                                {/* Title & Match */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <div>
                                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">
                                            {topCareer.career_title}
                                        </h2>
                                        <p className="text-sm md:text-base text-slate-500 font-medium">
                                            {topCareer.description}
                                        </p>
                                    </div>
                                    <div className="text-5xl md:text-6xl font-black text-primary">
                                        {topCareer.match_percentage}%
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                    <StatCard
                                        icon={<DollarSign className="w-4 h-4" />}
                                        label="Salary Range"
                                        value={topCareer.salary_range}
                                    />
                                    <StatCard
                                        icon={<TrendingUp className="w-4 h-4" />}
                                        label="Growth"
                                        value={topCareer.growth_outlook}
                                    />
                                    <StatCard
                                        icon={<Clock className="w-4 h-4" />}
                                        label="Work-Life"
                                        value={topCareer.work_life_balance}
                                    />
                                </div>

                                {/* Why This Match */}
                                <div className="mb-8">
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-slate-900">
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                        Why This Matches
                                    </h3>
                                    <ul className="space-y-3">
                                        {topCareer.reasons.map((reason, i) => (
                                            <li key={i} className="flex items-start gap-4 text-sm md:text-base text-slate-600 font-medium">
                                                <Zap className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Skills */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-primary">
                                            ✓ Neural Strengths
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {topCareer.required_skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-bold text-blue-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-amber-600">
                                            ⚠ Growth Vectors
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {topCareer.skill_gaps.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-[11px] font-bold text-amber-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Day to Day */}
                                <div className="mb-8">
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-widest mb-4 text-slate-900">
                                        Operational Framework
                                    </h3>
                                    <ul className="space-y-3">
                                        {topCareer.day_to_day.map((activity, i) => (
                                            <li key={i} className="flex items-start gap-4 text-sm md:text-base text-slate-600 font-medium">
                                                <Briefcase className="w-4 h-4 text-indigo-500 mt-1 flex-shrink-0" />
                                                <span>{activity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Action Plan */}
                                <div className="mb-8">
                                    <h3 className="text-lg md:text-xl font-black uppercase tracking-widest mb-6 text-slate-900">
                                        Execution Roadmap
                                    </h3>
                                    <div className="space-y-6">
                                        <ActionPlanSection
                                            title="Phase 1: Immediate"
                                            items={topCareer.action_plan.immediate}
                                            color="blue"
                                        />
                                        <ActionPlanSection
                                            title="Phase 2: Consolidation"
                                            items={topCareer.action_plan.short_term}
                                            color="indigo"
                                        />
                                        <ActionPlanSection
                                            title="Phase 3: Mastery"
                                            items={topCareer.action_plan.long_term}
                                            color="violet"
                                        />
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => createRoadmap(topCareer.career_title)}
                                        className="flex-1 py-4 rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        <Target className="w-5 h-5" />
                                        Initialize Roadmap
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}

// Helper Components
const StatCard = ({ icon, label, value }: any) => (
    <div className="glass p-4 rounded-xl border-border">
        <div className="flex items-center gap-2 mb-2 text-blue-500">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                {label}
            </span>
        </div>
        <p className="text-sm md:text-base font-bold">{value}</p>
    </div>
);

const ActionPlanSection = ({ title, items, color }: any) => (
    <div>
        <h4 className={`text-sm font-black uppercase tracking-widest mb-3 text-${color}-500`}>
            {title}
        </h4>
        <ul className="space-y-2">
            {items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                    <ArrowRight className={`w-4 h-4 text-${color}-500 mt-0.5 flex-shrink-0`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);
