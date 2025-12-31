'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, BrainCircuit, Target, Sparkles,
    ChevronRight, Star, Settings, Briefcase,
    Users, TrendingUp, DollarSign, Globe,
    Activity, Shield, Zap
} from 'lucide-react';
import Link from 'next/link';
import { TiltCard } from '@/components/tilt-card';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import careerService from '@/lib/services/career.service';
import { CareerPath } from '@/lib/types/career.types';
import { LoadingPage } from '@/components/shared/LoadingSpinner';

export default function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const [career, setCareer] = useState<CareerPath | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareer = async () => {
            try {
                const data = await careerService.getCareerById(id);
                setCareer(data);
            } catch (error) {
                console.error('Failed to fetch career:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCareer();
    }, [id]);

    if (loading) return <LoadingPage message="Syncing Neural Profile..." />;
    if (!career) return <div className="min-h-screen flex items-center justify-center">Career not found</div>;

    // Derived market stats for UI
    const marketStats = [
        { label: 'Market Demand', val: `${career.demand_score}/100` },
        { label: 'Growth Rating', val: `+${career.growth_rate}%` },
        { label: 'Complexity', val: career.level }
    ];

    const salaryText = career.salary_range
        ? `${career.salary_range.currency}${career.salary_range.min / 1000}k - ${career.salary_range.max / 1000}k`
        : 'Salary TBD';

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 mb-12"
                >
                    <Link href="/careers" className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 flex items-center gap-2 transition-opacity">
                        <ArrowLeft className="w-3 h-3" /> Back to Hub
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Content */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex flex-wrap items-center gap-4 mb-8">
                                <div className="px-4 py-1.5 rounded-full glass border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                    {career.industry ? career.industry[0] : career.category}
                                </div>
                                <div className="flex items-center gap-1 text-blue-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-blue-500" />)}
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-12">
                                {career.title} <span className="text-gradient">.Node</span>
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                <TiltCard className="h-full">
                                    <div className="glass-heavy p-10 rounded-[3rem] border-blue-500/20 h-full">
                                        <h3 className="text-sm font-black uppercase tracking-widest italic mb-8 flex items-center gap-3">
                                            <Target className="w-5 h-5 text-blue-600" /> Key Skills
                                        </h3>
                                        <ul className="space-y-6">
                                            {career.required_skills?.map((skill, i) => (
                                                <motion.li
                                                    key={i}
                                                    whileHover={{ x: 10 }}
                                                    className="flex items-start gap-4"
                                                >
                                                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                                                    <span className="text-sm font-bold opacity-80">{skill}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                </TiltCard>

                                <div className="space-y-8">
                                    <TiltCard>
                                        <div className="glass p-10 rounded-[3rem] border-blue-500/10 h-full">
                                            <h3 className="text-sm font-black uppercase tracking-widest italic mb-6 flex items-center gap-2">
                                                <Activity className="w-4 h-4" /> Average Salary
                                            </h3>
                                            <div className="text-4xl font-black italic mb-2 text-blue-600">{salaryText}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 text-blue-500">Yearly Market Projection</div>
                                        </div>
                                    </TiltCard>

                                    <div className="glass-heavy p-10 rounded-[3rem] border-blue-500/10">
                                        <h3 className="text-sm font-black uppercase tracking-widest italic mb-8">Growth Index</h3>
                                        <div className="h-[120px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={[
                                                    { year: '2023', val: 140 },
                                                    { year: '2024', val: 180 },
                                                    { year: '2025', val: 240 },
                                                    { year: '2026', val: 310 },
                                                    { year: '2027', val: 350 },
                                                ]}>
                                                    <defs>
                                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <Area type="monotone" dataKey="val" stroke="#2563eb" fillOpacity={1} fill="url(#colorVal)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                                            <span>Current Velocity</span>
                                            <span>Projected Scale</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-32 space-y-8"
                        >
                            <div className="glass-heavy p-8 rounded-[3rem] border-blue-500/20">
                                <h3 className="text-lg font-black italic uppercase tracking-tight mb-8">Neural Fit</h3>
                                <div className="relative w-full aspect-square bg-blue-500/5 rounded-[2rem] border border-blue-500/10 flex items-center justify-center overflow-hidden mb-8">
                                    <div className="absolute inset-4 border-2 border-blue-500/20 rounded-full border-dashed animate-spin-slow" />
                                    <div className="text-center">
                                        <span className="text-5xl font-black italic">{(career.demand_score || 85).toFixed(1)}%</span>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Symmetry Check</div>
                                    </div>
                                </div>
                                <Link href="/assessment">
                                    <button className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform">
                                        Verify Trajectory
                                    </button>
                                </Link>
                            </div>

                            <div className="glass p-8 rounded-[3rem] border-blue-500/5">
                                <h3 className="text-sm font-black uppercase tracking-widest italic mb-6">Market Telemetry</h3>
                                <div className="space-y-6">
                                    {marketStats.map(stat => (
                                        <div key={stat.label} className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                                                <span>{stat.label}</span>
                                                <span className="text-blue-500">{stat.val}</span>
                                            </div>
                                            <div className="h-1 w-full bg-muted rounded-full">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    className="h-full bg-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
