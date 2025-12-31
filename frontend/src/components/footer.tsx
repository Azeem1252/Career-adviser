'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Github, Twitter, Linkedin, Mail, ArrowRight, Zap, Target } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="relative pt-24 md:pt-40 pb-12 px-4 md:px-6 overflow-hidden border-t border-white/5">
            <div className="absolute inset-0 bg-blue-500/[0.02] -z-10" />

            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-30" />

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20">

                    {/* Brand section */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <Link href="/" className="flex items-center gap-3 mb-8 group w-fit">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
                                <BrainCircuit className="text-white w-7 h-7" />
                            </div>
                            <span className="text-2xl font-black italic uppercase tracking-tighter">
                                Carre<span className="text-blue-600">Adviser</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-lg font-medium mb-10 leading-relaxed max-w-xl">
                            Engineering architectural professional trajectories through neural logic and high-fidelity precision. The world's first absolute career strategy ecosystem.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: Github, href: '#' },
                                { Icon: Twitter, href: '#' },
                                { Icon: Linkedin, href: '#' },
                                { Icon: Mail, href: 'mailto:contact@carreadviser.ai' }
                            ].map(({ Icon, href }, i) => (
                                <motion.a
                                    key={i}
                                    href={href}
                                    whileHover={{ y: -5, scale: 1.1 }}
                                    className="w-12 h-12 rounded-2xl glass flex items-center justify-center hover:bg-blue-600 hover:text-white border-white/5 hover:border-blue-500/50 transition-all shadow-xl"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Links and Newsletter */}
                    <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                        <div className="lg:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-blue-500/60">Tactical Paths</h4>
                            <ul className="space-y-5">
                                {[
                                    { name: 'Careers', href: '/careers' },
                                    { name: 'Analyzer', href: '/analyzer' },
                                    { name: 'Interviewer', href: '/interviewer' },
                                    { name: 'Roadmaps', href: '/roadmaps' }
                                ].map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-sm font-bold opacity-60 hover:opacity-100 hover:text-blue-500 transition-all flex items-center gap-2 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="w-full glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Target className="w-24 h-24 rotate-12" />
                                </div>

                                <h4 className="text-lg font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                                    Neural <span className="text-blue-600">Alerts.</span>
                                </h4>
                                <p className="text-[11px] text-muted-foreground font-medium mb-8 leading-relaxed max-w-[200px]">
                                    Receive weekly architectural shift reports and market intelligence.
                                </p>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="ESTABLISH CONNECTION..."
                                        className="w-full bg-background/50 border border-white/5 p-5 pr-14 rounded-2xl text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-blue-600/30 transition-all"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 md:pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                            © 2025 CarreAdviser AI. Precise Execution.
                        </div>
                    </div>

                    <div className="flex gap-10">
                        {['Protocol', 'Privacy', 'Support'].map(item => (
                            <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 hover:text-blue-600 transition-all">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
