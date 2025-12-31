'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Moon, Sun, Menu, X, ChevronRight, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useAuthStore } from '@/store/auth.store';
import { UserMenu } from './auth/UserMenu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, checkAuth, user, logout } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const publicLinks = [
        { name: 'Careers', href: '/careers' },
        { name: 'Analyzer', href: '/analyzer' },
    ];

    const protectedLinks = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Analyzer', href: '/analyzer' },
        { name: 'Skill Assessment', href: '/assessment' },
        { name: 'Careers', href: '/careers' },
        { name: 'Cover Letter', href: '/cover-letter' },
        { name: 'Interviewer', href: '/interviewer' },
        { name: 'Roadmaps', href: '/roadmaps' },
    ];

    const displayLinks = isAuthenticated ? protectedLinks : publicLinks;

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-[100] transition-all duration-[150ms] px-4 md:px-8"
            >
                <div className={cn(
                    "max-w-[1280px] mx-auto flex justify-between items-center h-[56px] px-6 rounded-xl transition-all duration-[150ms]",
                    isScrolled
                        ? "bg-white/80 backdrop-blur-md border border-[var(--border)] shadow-sm"
                        : "bg-transparent border-transparent"
                )}>
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-[32px] h-[32px] bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-[150ms]">
                            <BrainCircuit className="text-white w-[20px] h-[20px]" />
                        </div>
                        <span className="text-[24px] font-semibold tracking-tight text-slate-900">
                            CarreAdviser<span className="text-primary">.</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {displayLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-semibold transition-all hover:text-primary",
                                    pathname === link.href ? "text-primary" : "text-slate-600"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">

                        <div className="hidden md:flex items-center">
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/auth/login">
                                        <button className="px-5 py-2 rounded-xl text-slate-600 font-bold text-sm hover:text-primary transition-colors">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link href="/auth/register">
                                        <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                            Sign up
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[150] lg:hidden bg-white p-6 pt-24"
                    >
                        <div className="flex flex-col h-full space-y-8">
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">Navigation</div>
                                <div className="grid grid-cols-1 gap-2">
                                    {displayLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border transition-all",
                                                pathname === link.href
                                                    ? "bg-blue-50 border-blue-100 text-blue-600"
                                                    : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200"
                                            )}
                                        >
                                            <span className="text-sm font-bold">{link.name}</span>
                                            <ChevronRight className="w-4 h-4 opacity-50" />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-900">{user?.name || 'User Profile'}</div>
                                            <div className="text-xs text-slate-500 font-medium">{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => logout()}
                                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-bold text-sm"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-auto grid grid-cols-1 gap-4">
                                    <Link href="/auth/login" className="w-full">
                                        <button className="w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-600">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link href="/auth/register" className="w-full">
                                        <button className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">
                                            Get Started
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

