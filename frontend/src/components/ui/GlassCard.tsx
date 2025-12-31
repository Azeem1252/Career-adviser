'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'heavy' | 'glow';
    borderColor?: 'emerald' | 'blue' | 'purple' | 'orange' | 'none';
    hover?: boolean;
    onClick?: () => void;
}

const borderColors = {
    emerald: 'border-blue-500/10 hover:border-blue-500/30',
    blue: 'border-blue-500/10 hover:border-blue-500/30',
    purple: 'border-purple-500/10 hover:border-purple-500/30',
    orange: 'border-orange-500/10 hover:border-orange-500/30',
    none: 'border-white/5 hover:border-white/10'
};

const variants = {
    default: 'glass',
    heavy: 'glass-heavy',
    glow: 'glass glow-card'
};

export function GlassCard({
    children,
    className,
    variant = 'default',
    borderColor = 'none',
    hover = true,
    onClick
}: GlassCardProps) {
    const Component = hover ? motion.div : 'div';
    const hoverProps = hover ? { whileHover: { y: -3, scale: 1.01 } } : {};

    return (
        <Component
            {...hoverProps}
            onClick={onClick}
            className={cn(
                variants[variant],
                'rounded-[2rem] border transition-all duration-300',
                borderColors[borderColor],
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </Component>
    );
}

// Glass Panel - simpler variant for sections
interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'sm' | 'md' | 'lg' | 'xl';
}

const paddings = {
    sm: 'p-4 md:p-6',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-10',
    xl: 'p-10 md:p-14'
};

export function GlassPanel({ children, className, padding = 'md' }: GlassPanelProps) {
    return (
        <div className={cn(
            'glass-heavy rounded-[2.5rem] md:rounded-[3rem] border-white/5',
            paddings[padding],
            className
        )}>
            {children}
        </div>
    );
}
