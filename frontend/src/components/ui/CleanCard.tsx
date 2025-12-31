'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CleanCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg' | 'auto';
    padding?: string;  // Allow custom padding override
}

// Design System: Card height limits
const sizeStyles = {
    sm: 'max-h-[120px] overflow-y-auto',  // Small card max 120px
    md: 'max-h-[180px] overflow-y-auto',  // Medium card max 180px
    lg: 'max-h-[260px] overflow-y-auto',  // Large card max 260px
    auto: ''  // No height limit
};

export function CleanCard({
    children,
    className,
    hover = true,
    onClick,
    size = 'auto',
    padding
}: CleanCardProps) {
    const Component = hover ? motion.div : 'div';
    const hoverProps = hover ? {
        whileHover: { y: -4, transition: { duration: 0.15 } }  // 150ms transition
    } : {};

    return (
        <Component
            {...hoverProps}
            onClick={onClick}
            className={cn(
                // Design System: Card base styles
                'bg-white border border-[var(--border)] rounded-[12px] shadow-sm',
                padding || 'p-4',  // Use custom padding or default to p-4
                sizeStyles[size],
                onClick && 'cursor-pointer',
                className
            )}
        >
            {children}
        </Component>
    );
}

export function CleanPanel({
    children,
    className,
    size = 'auto'
}: {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'auto';
}) {
    return (
        <div className={cn(
            'bg-white border border-[var(--border)] shadow-sm rounded-[12px] p-4',
            sizeStyles[size],
            className
        )}>
            {children}
        </div>
    );
}
