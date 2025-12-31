'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, LayoutDashboard, Briefcase,
    FileSearch, MessageSquare, BarChart3,
    Map, BrainCircuit, Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const actions = [
    { id: 'dash', name: 'User Dashboard', icon: LayoutDashboard, href: '/dashboard', cat: 'Navigation' },
    { id: 'careers', name: 'Career Knowledge Hub', icon: Briefcase, href: '/careers', cat: 'Navigation' },
    { id: 'analyzer', name: 'Resume Gap Analyzer', icon: FileSearch, href: '/analyzer', cat: 'Tools' },
    { id: 'mock', name: 'Mock Interviewer', icon: MessageSquare, href: '/interviewer', cat: 'Tools' },
    { id: 'analytics', name: 'Market Telemetry', icon: BarChart3, href: '/analytics', cat: 'Tools' },
    { id: 'roadmaps', name: 'Interactive Roadmaps', icon: Map, href: '/roadmaps', cat: 'Trajectories' },
    { id: 'assess', name: 'Neural Assessment', icon: BrainCircuit, href: '/assessment', cat: 'Trajectories' },
];

export const CommandPalette = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredActions = useMemo(() => {
        if (!query) return actions;
        return actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
    }, [query]);

    const navigate = (href: string) => {
        router.push(href);
        setOpen(false);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-2xl glass-heavy rounded-[2.5rem] border-emerald-500/20 overflow-hidden relative shadow-2xl"
                    >
                        <div className="p-8 border-b border-border flex items-center gap-4">
                            <Search className="w-6 h-6 text-emerald-500" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="EXECUTE NEURAL COMMAND..."
                                className="w-full bg-transparent border-none text-xl font-black italic uppercase tracking-tighter focus:outline-none placeholder:opacity-30"
                            />
                            <div className="px-3 py-1.5 rounded-lg glass border-border text-[10px] font-black uppercase tracking-widest opacity-40">ESC</div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                            {filteredActions.map((action) => (
                                <motion.button
                                    key={action.id}
                                    whileHover={{ x: 10 }}
                                    onClick={() => navigate(action.href)}
                                    className="w-full p-6 rounded-2xl flex items-center gap-6 hover:bg-emerald-500/10 transition-colors text-left group"
                                >
                                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-60 transition-opacity">{action.cat}</div>
                                        <div className="text-lg font-black italic uppercase tracking-tight">{action.name}</div>
                                    </div>
                                    <Command className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                                </motion.button>
                            ))}

                            {filteredActions.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="text-sm font-black uppercase tracking-widest opacity-30 italic">No node mapping found for "{query}"</div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-between items-center bg-muted/5">
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 rounded bg-muted text-[8px] font-black">ENTER</div>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Navigate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 rounded bg-muted text-[8px] font-black">↑↓</div>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Browse</span>
                                </div>
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Neural Gateway Alpha v1.0</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
