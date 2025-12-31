'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, ArrowUpRight, Zap, Loader2 } from 'lucide-react';
import { aiService } from '@/lib/services';
import { Skeleton } from '@/components/skeleton';

export const TrendsWidget = () => {
    const [trends, setTrends] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const data = await aiService.getMarketTrends();
                setTrends(data);
            } catch (err) {
                console.error("Market trends load failure:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    if (loading) {
        return (
            <div className="glass p-8 rounded-[3rem] border-white/5 h-full min-h-[400px]">
                <div className="flex items-center gap-4 mb-8">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <Skeleton width={150} height={20} />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-2">
                            <Skeleton width="40%" height={16} />
                            <Skeleton width="100%" height={80} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!trends || trends.length === 0) return null;

    return (
        <section className="glass-heavy p-8 md:p-10 rounded-[3rem] border-white/5 h-full">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest italic">Market Intelligence</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Industry Pulse 1.0</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" /> Live Analysis
                </div>
            </div>

            <div className="space-y-6">
                {trends.map((trend: any, idx: number) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-6 rounded-2xl glass border border-white/5 hover:border-purple-500/20 transition-all cursor-default"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="font-black italic uppercase text-xs tracking-wider text-purple-400">{trend.title}</div>
                            <div className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase tracking-widest opacity-60">
                                {trend.category || 'General'}
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mb-4">
                            {trend.description}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Outlook</span>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(v => (
                                        <div key={v} className={`w-1.5 h-1.5 rounded-full ${v <= (trend.growth_score || 3) ? 'bg-blue-500' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                            <ArrowUpRight className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-purple-500" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-8 py-4 rounded-xl border border-white/5 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all">
                Full Industry Report
            </button>
        </section>
    );
};
