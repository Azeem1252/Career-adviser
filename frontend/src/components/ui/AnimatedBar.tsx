'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBarProps {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    icon?: React.ReactNode;
    color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    delay?: number;
    className?: string;
}

const colorClasses = {
    emerald: 'bg-blue-600',
    blue: 'bg-blue-600',
    purple: 'bg-indigo-600',
    orange: 'bg-orange-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600'
};

const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
};

export function AnimatedBar({
    value,
    max = 100,
    label,
    showValue = true,
    icon,
    color = 'blue',
    size = 'md',
    delay = 0,
    className
}: AnimatedBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={cn('space-y-2.5', className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <div className="flex items-center gap-2">
                            {icon}
                            <span className="text-sm font-semibold text-slate-700">{label}</span>
                        </div>
                    )}
                    {showValue && (
                        <span className="text-sm font-bold text-slate-900">{value}%</span>
                    )}
                </div>
            )}
            <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', sizeClasses[size])}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
                    className={cn(
                        'h-full rounded-full',
                        colorClasses[color]
                    )}
                />
            </div>
        </div>
    );
}


// Score bar variant with more decorations
interface ScoreBarProps {
    label: string;
    score: number;
    color: 'emerald' | 'blue' | 'purple' | 'orange';
    icon: React.ReactNode;
    delay?: number;
}

export function ScoreBar({ label, score, color, icon, delay = 0 }: ScoreBarProps) {
    const gradientClasses = {
        emerald: 'from-blue-500 to-indigo-500',
        blue: 'from-blue-500 to-indigo-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-amber-500'
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-bold text-white">{label}</span>
                </div>
                <span className="text-lg font-black text-white">{score}%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay, ease: 'easeOut' }}
                    className={cn('h-full rounded-full bg-gradient-to-r', gradientClasses[color])}
                />
            </div>
        </div>
    );
}
