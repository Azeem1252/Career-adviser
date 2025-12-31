'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function StatCard({ icon, val, label, border }: { icon: React.ReactNode, val: number | string, label: string, border: string }) {
    const accentColor = {
        blue: 'text-blue-600',
        indigo: 'text-indigo-600',
        rose: 'text-rose-600',
        amber: 'text-amber-600'
    }[border] || 'text-blue-600';

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="clean-card p-6 flex flex-col justify-between h-full"
        >
            <div>
                <div className={`mb-4 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center ${accentColor}`}>
                    {icon}
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</div>
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl font-bold text-slate-900"
            >
                {val}
            </motion.div>
        </motion.div>
    );
}

export function ActionNode({ href, icon, title, desc, iconColor }: { href: string, icon: React.ReactNode, title: string, desc: string, iconColor?: string }) {
    return (
        <Link href={href} className="block h-full">
            <motion.div
                whileHover={{ y: -5 }}
                className="clean-card p-6 group h-full flex flex-col"
            >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 font-medium mb-6 flex-grow">{desc}</p>
                <div className="flex items-center text-primary font-bold text-sm">
                    Open Protocol <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </motion.div>
        </Link>
    );
}

