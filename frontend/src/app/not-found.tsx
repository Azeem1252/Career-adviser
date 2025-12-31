'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Search, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full text-center"
            >
                <div className="relative mb-12">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-32 h-32 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-emerald-500/30"
                    >
                        <AlertTriangle className="w-16 h-16 text-emerald-500" />
                    </motion.div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-6">
                    404 <span className="text-gradient">Node Lost.</span>
                </h1>

                <p className="text-xl text-muted-foreground font-medium mb-12 max-w-md mx-auto">
                    The neural pathway you're seeking doesn't exist in our architecture.
                    Let's redirect you to a known coordinate.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-xl shadow-blue-500/20"
                            aria-label="Return to homepage"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </motion.button>
                    </Link>
                    <Link href="/careers">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="px-8 py-4 rounded-2xl glass border-blue-500/30 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3"
                            aria-label="Explore careers"
                        >
                            <Search className="w-5 h-5" />
                            Explore Careers
                        </motion.button>
                    </Link>
                </div>

                <div className="mt-16 glass p-6 rounded-2xl border-blue-500/10">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">
                        Quick Navigation
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Analyzer', href: '/analyzer' },
                            { label: 'Roadmaps', href: '/roadmaps' },
                            { label: 'Analytics', href: '/analytics' },
                        ].map((link) => (
                            <Link key={link.href} href={link.href}>
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="p-3 rounded-xl bg-muted/50 hover:bg-emerald-500/10 transition-colors text-sm font-bold"
                                >
                                    {link.label}
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
