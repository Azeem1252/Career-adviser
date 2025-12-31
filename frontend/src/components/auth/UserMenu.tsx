'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const UserMenu = () => {
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        router.push('/');
    };

    if (!user) return null;

    // Get initials for avatar
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm"
            >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                        Level {Math.floor((Number(user.xp) || 0) / 1000) + 1}
                    </span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 p-1"
                    >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black overflow-hidden ring-4 ring-emerald-500/5">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user.name}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs px-1">
                                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">XP Status</span>
                                <span className="font-black text-emerald-500">
                                    {(Number(user.xp) || 0).toLocaleString()} <span className="text-[10px] text-slate-400">Total</span>
                                </span>
                            </div>
                        </div>

                        <div className="p-1 space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all group"
                            >
                                <User className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                <span className="text-sm font-bold text-slate-900 group-hover:text-white">Manage Profile</span>
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-all group"
                            >
                                <Settings className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                <span className="text-sm font-bold text-slate-900 group-hover:text-white">Account Settings</span>
                            </Link>
                        </div>

                        <div className="p-1 border-t border-slate-900/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all group"
                            >
                                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                <span className="text-sm font-bold group-hover:text-white text-slate-900">
                                    Sign Out
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
