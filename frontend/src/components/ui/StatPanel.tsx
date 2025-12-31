'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon, Zap } from 'lucide-react';

interface StatPanelProps {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color?: 'emerald' | 'blue' | 'purple' | 'orange';
    trend?: number;
    className?: string;
}

const colorStyles = {
    emerald: {
        icon: 'text-blue-500',
        border: 'border-blue-500/10 hover:border-blue-500/30',
        glow: 'group-hover:shadow-blue-500/20'
    },
    blue: {
        icon: 'text-blue-500',
        border: 'border-blue-500/10 hover:border-blue-500/30',
        glow: 'group-hover:shadow-blue-500/20'
    },
    purple: {
        icon: 'text-purple-500',
        border: 'border-purple-500/10 hover:border-purple-500/30',
        glow: 'group-hover:shadow-purple-500/20'
    },
    orange: {
        icon: 'text-orange-500',
        border: 'border-orange-500/10 hover:border-orange-500/30',
        glow: 'group-hover:shadow-orange-500/20'
    }
};

export function StatPanel({
    icon,
    value,
    label,
    color = 'emerald',
    trend,
    className
}: StatPanelProps) {
    const styles = colorStyles[color];

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className={cn(
                'glass p-4 md:p-5 rounded-[1.5rem] border transition-all group',
                styles.border,
                styles.glow,
                'hover:shadow-lg',
                className
            )}
        >
            <div className="mb-3">{icon}</div>
            <div className="flex items-end gap-2">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-3xl font-black italic"
                >
                    {value}
                </motion.div>
                {trend !== undefined && (
                    <span className={cn(
                        'text-xs font-bold mb-1',
                        trend >= 0 ? 'text-blue-500' : 'text-red-500'
                    )}>
                        {trend >= 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                {label}
            </div>
        </motion.div>
    );
}

// Metric card - more detailed stat display
interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: number;
    suffix?: string;
    description?: string;
    color?: 'emerald' | 'blue' | 'purple' | 'orange';
    showBar?: boolean;
    trend?: { growth_score: number };
}

export function MetricCard({
    icon,
    title,
    value,
    suffix = '%',
    description,
    color = 'blue', // Changed default color from 'emerald' to 'blue'
    showBar = true,
    trend // Destructure trend prop
}: MetricCardProps) {
    const styles = colorStyles[color];

    return (
        <div className={cn(
            'glass p-6 rounded-3xl border-white/5 hover:border-blue-500/20 transition-all group'
        )}>
            <div className="flex items-center justify-between gap-3 mb-4"> {/* Adjusted for new elements */}
                <div className="flex items-center gap-3">
                    <div className={cn('opacity-60 group-hover:opacity-100 transition-opacity', styles.icon)}>
                        {icon}
                    </div>
                    <div className="text-[9px] font-black uppercase opacity-40 tracking-widest">{title}</div>
                </div>
                {/* Inserted new elements here */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest">
                    <Zap className="w-3 h-3" /> Live Analysis
                </div>
            </div>
            <div className="flex items-center justify-between mb-3"> {/* Adjusted for new elements */}
                <div className="text-3xl font-black">{value}{suffix}</div>
                {trend && ( // Conditionally render trend outlook
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black italic uppercase tracking-widest text-blue-500">Outlook</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(v => (
                                <div key={v} className={`w-1.5 h-1.5 rounded-full ${v <= (trend.growth_score || 3) ? 'bg-blue-500' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {showBar && (
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', `bg-${color}-500`)}
                        style={{ backgroundColor: color === 'emerald' ? '#2563eb' : color === 'blue' ? '#2563eb' : color === 'purple' ? '#4f46e5' : '#f97316' }}
                    />
                </div>
            )}
            {description && (
                <p className="text-xs text-muted-foreground mt-3">{description}</p>
            )}
        </div>
    );
}
