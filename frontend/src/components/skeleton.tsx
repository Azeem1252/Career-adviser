'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export const Skeleton = ({ className = "", width, height, circle }: SkeletonProps) => {
    return (
        <div
            className={`relative overflow-hidden bg-muted/20 rounded-xl ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius: circle ? '50%' : undefined
            }}
        >
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"
            />
        </div>
    );
};

export const SkeletonGroup = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {children}
        </div>
    );
};
