'use client';

import React, { ReactNode } from 'react';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import './auth-animations.css';

interface AuthContainerProps {
    children: ReactNode;
    mode: 'login' | 'register';
    onToggle: () => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children, mode, onToggle }) => {
    const isActive = mode === 'register';

    return (
        <main className="min-h-screen bg-[#2d2d32] flex items-center justify-center p-4 md:p-8 font-sans">
            <div className="w-full max-w-5xl">
                {/* Brand Header (Mobile Only) */}
                <div className="flex justify-center mb-6 md:hidden">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">
                            Carre<span className="text-blue-500 italic">Adviser</span>
                        </span>
                    </Link>
                </div>

                {/* Main Container */}
                <div className={`auth-container relative w-full min-h-[550px] md:min-h-[600px] border-2 border-blue-600 rounded-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] overflow-hidden bg-[#3d3d42] ${isActive ? 'active' : ''}`}>

                    {/* Diagonal Background Shape */}
                    <div className={`diagonal-shape ${isActive ? 'register-mode' : 'login-mode'}`} />

                    {/* Login Form Box */}
                    <div className="form-box-login hidden md:flex">
                        {!isActive && (
                            <div style={{ '--delay': 0, '--delay-out': 0 } as React.CSSProperties}>
                                {children}
                            </div>
                        )}
                    </div>

                    {/* Register Form Box */}
                    <div className="form-box-register hidden md:flex">
                        {isActive && (
                            <div style={{ '--delay': 0, '--delay-in': 0 } as React.CSSProperties}>
                                {children}
                            </div>
                        )}
                    </div>

                    {/* Mobile Form (Always visible) */}
                    <div className="md:hidden p-8 relative z-30">
                        {children}
                    </div>

                    {/* Login Info Content (Right Side) */}
                    <div className="info-content-login hidden md:flex">
                        <h2
                            className="text-4xl md:text-5xl font-bold uppercase mb-4 leading-tight text-white"
                            style={{ '--delay': 0, '--delay-out': 0 } as React.CSSProperties}
                        >
                            WELCOME<br />BACK!
                        </h2>
                        <p
                            className="text-white/90 text-sm leading-relaxed max-w-xs mb-8"
                            style={{ '--delay': 1, '--delay-out': 1 } as React.CSSProperties}
                        >
                            We are happy to have you with us again. If you need anything, we are here to help.
                        </p>
                        <button
                            onClick={onToggle}
                            className="px-8 py-3 rounded-full border-2 border-white/40 bg-transparent text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-slate-900 transition-all shadow-lg pointer-events-auto cursor-pointer"
                            style={{ '--delay': 2, '--delay-out': 2 } as React.CSSProperties}
                        >
                            Don't have an account? Sign Up
                        </button>
                    </div>

                    {/* Register Info Content (Left Side) */}
                    <div className="info-content-register hidden md:flex">
                        <h2
                            className="text-4xl font-bold uppercase mb-4 text-white"
                            style={{ '--delay': 0, '--delay-in': 0 } as React.CSSProperties}
                        >
                            WELCOME!
                        </h2>
                        <p
                            className="text-white/90 text-sm leading-relaxed max-w-xs mb-8"
                            style={{ '--delay': 1, '--delay-in': 1 } as React.CSSProperties}
                        >
                            We're delighted to have you here. If you need any assistance, feel free to reach out.
                        </p>
                        <button
                            onClick={onToggle}
                            className="px-8 py-3 rounded-full border-2 border-white/40 bg-transparent text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-slate-900 transition-all shadow-lg pointer-events-auto cursor-pointer"
                            style={{ '--delay': 2, '--delay-in': 2 } as React.CSSProperties}
                        >
                            Already have an account? Sign In
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden px-8 pb-6">
                        <p className="text-center text-sm text-slate-300">
                            {isActive ? "Already have an account? " : "Don't have an account? "}
                            <button
                                onClick={onToggle}
                                className="text-blue-500 font-semibold hover:underline ml-1"
                            >
                                {isActive ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                        © 2024 CARREADVISER — SECURE ACCESS PORTAL
                    </p>
                </div>
            </div>
        </main>
    );
};
