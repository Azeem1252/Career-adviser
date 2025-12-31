'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, Target, TrendingUp, Briefcase,
    DollarSign, BarChart3, Zap, ArrowRight,
    CheckCircle2, Brain, Award, Rocket, Lightbulb,
    Star, Users, Globe, LineChart, TrendingDown, RefreshCw
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import api from '@/lib/api';
import { CleanCard } from '@/components/ui/CleanCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { AnimatedBar } from '@/components/ui/AnimatedBar';
import { cn } from '@/lib/utils';

// Enhanced Career Match Card Component
function CareerMatchCard({
    title,
    match,
    salary,
    demand,
    delay = 0,
    rank
}: {
    title: string;
    match: number;
    salary: string;
    demand: string;
    delay?: number;
    rank: number;
}) {
    const getDemandColor = (demand: string) => {
        if (demand === 'High') return 'from-green-500 to-emerald-600';
        if (demand === 'Medium') return 'from-yellow-500 to-orange-600';
        return 'from-red-500 to-rose-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay }}
        >
            <CleanCard
                className="flex flex-col bg-white hover:shadow-2xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-300 relative overflow-hidden group"
                padding="p-8"
            >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm",
                        rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                            rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500" :
                                "bg-gradient-to-br from-orange-400 to-orange-600"
                    )}>
                        #{rank}
                    </div>
                </div>

                <div className="flex items-start gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                        <div className="flex items-center gap-2">
                            <div className={cn("px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r", getDemandColor(demand))}>
                                {demand} Demand
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <div>
                        <div className="flex items-center justify-between text-sm font-bold mb-3">
                            <span className="text-slate-600">Market Fit Score</span>
                            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{match}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${match}%` }}
                                transition={{ duration: 1, delay: delay + 0.3 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                            <div className="text-xs font-bold text-green-700 uppercase tracking-wider">Average Salary</div>
                            <div className="text-lg font-black text-green-900">{salary}</div>
                        </div>
                    </div>
                </div>

                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group mt-auto">
                    Explore Roadmap
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </CleanCard>
        </motion.div>
    );
}

// Enhanced Career Insights Panel
function CareerInsightsPanel({ strengths, recommendations }: { strengths: string[]; recommendations: string[] }) {
    return (
        <CleanCard padding="p-10" className="bg-white border-2 border-slate-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    <Lightbulb className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Strategic AI Insights</h3>
                    <p className="text-sm text-slate-600 font-medium">Powered by advanced career intelligence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Strengths */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">
                            Core Competencies
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {strengths.map((strength, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-300 transition-all group"
                            >
                                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-slate-700 leading-relaxed">{strength}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">
                            Growth Trajectory
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-300 transition-all group"
                            >
                                <Rocket className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-slate-700 leading-relaxed">{rec}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </CleanCard>
    );
}

export default function CareersPage() {
    const { user } = useAuthStore();
    const [assessmentData, setAssessmentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/assessment/latest');
                setAssessmentData(response.data);
            } catch (err) {
                console.error('Failed to fetch assessment:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const scores = assessmentData?.scores || {
        technical_score: 0,
        soft_skills_score: 0,
        market_fit_score: 0,
        overall_score: 0
    };

    const recommendedRoles = assessmentData?.recommended_roles || [];

    const keyStrengths = assessmentData?.strengths || [];

    const recommendations = assessmentData?.next_steps || [];

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-24 md:pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Enhanced Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
                            <Sparkles className="w-4 h-4" />
                            <span>AI-Powered Career Intelligence</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
                            Career <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Intelligence</span>
                        </h1>
                        <p className="max-w-3xl text-slate-600 text-xl md:text-2xl font-medium leading-relaxed">
                            Strategic recommendations powered by our neural engine analysis of your skills and current market dynamics.
                        </p>
                    </motion.div>

                    {/* Main Scores Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <CleanCard padding="p-10" className="bg-white border-2 border-slate-200 hover:shadow-2xl transition-all duration-300 mb-16">
                            <div className="flex flex-col lg:flex-row items-center gap-12">
                                {/* Circular Score */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <CircularProgress score={scores.overall_score} size={120} />
                                    <div className="mt-6 text-center">
                                        <div className="text-xl font-black text-slate-900 mb-1">Market Readiness</div>
                                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Overall Profile Fit</div>
                                    </div>
                                </div>

                                {/* Score Bars */}
                                <div className="flex-1 w-full space-y-8">
                                    <AnimatedBar
                                        label="Technical Competency"
                                        value={scores.technical_score}
                                        color="blue"
                                        icon={<Brain className="w-5 h-5 text-blue-600" />}
                                    />
                                    <AnimatedBar
                                        label="Soft Skill Resonance"
                                        value={scores.soft_skills_score}
                                        color="purple"
                                        icon={<Target className="w-5 h-5 text-indigo-600" />}
                                    />
                                    <AnimatedBar
                                        label="Current Market Fit"
                                        value={scores.market_fit_score}
                                        color="orange"
                                        icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
                                    />
                                </div>
                            </div>
                        </CleanCard>
                    </motion.div>

                    {/* Top Career Matches */}
                    <section className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-between mb-10"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    <Rocket className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">Recommended Trajectories</h2>
                                    <p className="text-sm text-slate-600 font-medium">Based on your unique skillset and market demand</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                                <BarChart3 className="w-4 h-4 text-slate-600" />
                                <span className="text-sm font-bold text-slate-700">{recommendedRoles.length} Matches</span>
                            </div>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {loading ? (
                                <div className="col-span-full py-20 text-center">
                                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium">Crunching your career data...</p>
                                </div>
                            ) : recommendedRoles.length > 0 ? (
                                (recommendedRoles as any[]).map((role: { title: string; match: number; salary: string; demand: string }, idx: number) => (
                                    <CareerMatchCard
                                        key={idx}
                                        {...role}
                                        rank={idx + 1}
                                        delay={0.3 + idx * 0.1}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                    <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900 mb-2">No Profiles Found</h3>
                                    <p className="text-slate-500 font-medium mb-6">Take the Skill Assessment to unlock your neural career recommendations.</p>
                                    <Link href="/assessment">
                                        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                                            Start Assessment
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Career Insights Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <CareerInsightsPanel
                            strengths={keyStrengths}
                            recommendations={recommendations}
                        />
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-16"
                    >
                        <CleanCard padding="p-12" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center relative overflow-hidden border-2 border-slate-700">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Take Action</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black mb-6">Ready to Accelerate Your Career?</h3>
                                <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
                                    Get personalized roadmaps, skill assessments, and expert guidance to reach your professional goals faster.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/assessment">
                                        <button className="group px-10 py-5 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-50 transition-all duration-300 shadow-2xl shadow-white/10 hover:scale-105 flex items-center gap-3">
                                            Take Assessment
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                    <Link href="/roadmaps">
                                        <button className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-all duration-300">
                                            View Roadmaps
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </CleanCard>
                    </motion.div>

                </div>
            </main>
        </ProtectedRoute>
    );
}
