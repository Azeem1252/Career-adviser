'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[9999]"
            style={{ scaleX }}
        />
    );
};

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export const ScrollReveal = ({ children, className = "", delay = 0 }: ScrollRevealProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface ParallaxProps {
    children: React.ReactNode;
    offset?: number;
    className?: string;
}

export const Parallax = ({ children, offset = 50, className = "" }: ParallaxProps) => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, offset]);

    return (
        <motion.div style={{ y }} className={className}>
            {children}
        </motion.div>
    );
};
