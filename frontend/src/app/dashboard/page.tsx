'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles, FileText, Search, Map as MapIcon, Briefcase,
    Clock, ChevronRight, TrendingUp, Target, Zap, Award,
    BarChart, LineChart, Users, Rocket, Brain, Star, ArrowRight, ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { aiService, userService, jobTrackerService } from '@/lib/services';
import { CleanCard, CleanPanel } from '@/components/ui/CleanCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { AnimatedBar } from '@/components/ui/AnimatedBar';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { user, checkAuth } = useAuthStore();
    const router = useRouter();
    const [savedRuns, setSavedRuns] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [latestAssessment, setLatestAssessment] = useState<any>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoadingData(true);
            try {
                await checkAuth();
                const [runs, dashboardStats, assessment, jobsList] = await Promise.all([
                    aiService.getAnalysisHistory().catch(() => []),
                    userService.getUserStats().catch(() => ({
                        total_projects: 0,
                        total_certifications: 0,
                        total_analyses: 0,
                        total_roadmaps: 0,
                        completion_rate: 0
                    })),
                    aiService.getLatestAssessment().catch(() => null),
                    jobTrackerService.getApplications().catch(() => [])
                ]);
                setSavedRuns(runs.slice(0, 5));
                setStats(dashboardStats);
                setLatestAssessment(assessment);
            } catch (err) {
                console.error("Dashboard data load failure:", err);
            } finally {
                setLoadingData(false);
            }
        };
        loadDashboardData();
    }, [checkAuth]);

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-[1400px] mx-auto">

                    {/* Enhanced Header */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
                                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Professional'}</span>
                                </h1>
                                <p className="text-lg text-slate-600 font-medium">Your strategic career command center</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <button className="p-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md">
                                        <Zap className="w-5 h-5" />
                                    </button>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-3 border-white shadow-lg overflow-hidden flex items-center justify-center text-white font-black text-lg">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                    >
                        {[
                            { label: 'Analyses', value: stats?.total_analyses || 0, icon: BarChart, color: 'from-blue-500 to-blue-600' },
                            { label: 'Roadmaps', value: stats?.total_roadmaps || 0, icon: MapIcon, color: 'from-indigo-500 to-indigo-600' },
                            { label: 'Projects', value: stats?.total_projects || 0, icon: Briefcase, color: 'from-violet-500 to-violet-600' },
                            { label: 'Certifications', value: stats?.total_certifications || 0, icon: Award, color: 'from-purple-500 to-purple-600' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                            >
                                <CleanCard padding="p-6" className="bg-white hover:shadow-xl transition-all duration-300 border-slate-200 group cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                </CleanCard>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column - 2 rows */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Profile Status Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <CleanCard padding="p-10" className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-slate-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                                    {/* Decorative gradient */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full mb-4">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Career Profile</span>
                                                </div>
                                                <h2 className="text-3xl font-black text-slate-900 mb-3">Your Professional Journey</h2>
                                                <p className="text-slate-600 font-medium text-base">Track your progress and optimize your career trajectory</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-10">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-base font-bold text-slate-700">Profile Completion</span>
                                                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                    {stats?.completion_rate || 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stats?.completion_rate || 0}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 mb-10">
                                            <CircularProgress
                                                score={user?.career_preferences?.top_recommendations?.[0]?.match || 0}
                                                size={80}
                                                label="Core Match"
                                            />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Top Career Match</div>
                                                <div className="text-2xl font-black text-slate-900 mb-3">
                                                    {user?.career_preferences?.top_recommendations?.[0]?.title || 'Trajectory Pending'}
                                                </div>
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-bold shadow-sm">
                                                    <Star className="w-4 h-4 fill-blue-600" />
                                                    {user?.career_preferences?.top_recommendations?.[0]?.match || '0'}% Fit Score
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { href: '/analyzer', icon: FileText, label: 'Analyze', color: 'from-indigo-500 to-indigo-600' },
                                                { href: '/assessment', icon: Target, label: 'Assess', color: 'from-violet-500 to-violet-600' }
                                            ].map((item, i) => (
                                                <Link key={i} href={item.href}>
                                                    <div className="group flex flex-col items-center p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
                                                        <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", item.color)}>
                                                            <item.icon className="w-7 h-7 text-white" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </CleanCard>
                            </motion.div>

                            {/* Skill Assessment Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <CleanCard padding="p-10" className="bg-white border-2 border-slate-200 hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Skill Assessment</h3>
                                            <p className="text-sm text-slate-600 font-medium">Your current competency levels</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                            <Target className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-8 mb-8">
                                        <AnimatedBar label="Technical Arsenal" value={latestAssessment?.scores?.technical_score || 0} color="blue" />
                                        <AnimatedBar label="Intellectual Soft Skills" value={latestAssessment?.scores?.soft_skills_score || 0} color="purple" />
                                        <AnimatedBar label="Market Alignment" value={latestAssessment?.scores?.market_fit_score || 0} color="orange" />
                                    </div>

                                    <div className="pt-8 border-t-2 border-slate-100 space-y-4">
                                        {latestAssessment ? (
                                            <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 mb-2">Latest Diagnostic: {new Date(latestAssessment.completed_at).toLocaleDateString()}</div>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                        Your trajectory is currently optimized for a {user?.career_preferences?.top_recommendations?.[0]?.title || 'new career path'}.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-slate-500 font-medium mb-4">No diagnostic data found. Unlock your profile insights.</p>
                                                <Link href="/assessment">
                                                    <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20">
                                                        Start AI Assessment
                                                    </button>
                                                </Link>
                                            </div>
                                        )}
                                        {latestAssessment && (
                                            <Link href="/assessment" className="block">
                                                <button className="w-full py-4 border-2 border-slate-100 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2">
                                                    <Zap className="w-4 h-4 text-amber-500" />
                                                    Retake Diagnostic
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </CleanCard>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">

                            {/* Career Insights Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <CleanCard padding="p-8" className="bg-white border-2 border-slate-200 hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-900">Career Insights</h3>
                                        <Link href="/careers" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                                            Full Report
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>

                                    <div className="mb-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-5 h-5 text-blue-400" />
                                                <div className="text-sm font-bold text-blue-400">AI Analysis</div>
                                            </div>
                                            <p className="text-sm leading-relaxed font-medium text-slate-200">
                                                {latestAssessment?.recommended_roles?.[0]
                                                    ? `Based on your ${latestAssessment.recommended_roles[0].match}% match for ${latestAssessment.recommended_roles[0].title}, focusing on the identified skills will accelerate your growth.`
                                                    : user?.career_preferences?.top_recommendations?.[0]?.title
                                                        ? `Based on your ${user?.career_preferences?.top_recommendations?.[0]?.match}% match for ${user?.career_preferences?.top_recommendations?.[0]?.title}, focusing on your strategic interests will accelerate your growth.`
                                                        : "Initialize your first assessment to unlock personalized career trajectory insights and match percentages."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black text-slate-900">Growth Opportunities</div>
                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div className="space-y-3">
                                            {(latestAssessment?.strengths || [
                                                'Advanced System Design',
                                                'Team Mentorship Skills',
                                                'Cloud Infrastructure'
                                            ]).slice(0, 3).map((item: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-slate-700 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all font-medium group cursor-pointer">
                                                    <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-blue-500" : i === 1 ? "bg-indigo-500" : "bg-violet-500")} />
                                                    {item}
                                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CleanCard>
                            </motion.div>

                            {/* Action Plan Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <CleanCard padding="p-8" className="bg-white border-2 border-slate-200 hover:shadow-2xl transition-all duration-300">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-900">Action Plan</h3>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                                            <Clock className="w-3 h-3 text-green-600" />
                                            <span className="text-xs font-bold text-green-700 uppercase">Live</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {[
                                            { task: "Analyze your first resume", path: "/analyzer" },
                                            { task: "Complete a career assessment", path: "/assessment" },
                                            { task: "Log your first application", path: "/job-tracker" }
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                onClick={() => router.push(item.path)}
                                                className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black",
                                                        i === 0
                                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                                            : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{item.task}</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => router.push('/roadmaps')}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group"
                                    >
                                        Generate Full Career Plan
                                        <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </CleanCard>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
