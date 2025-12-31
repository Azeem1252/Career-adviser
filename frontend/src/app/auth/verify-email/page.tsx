'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import '../auth.css';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const response = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth?mode=login');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    'Email verification failed'
                );
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[450px] w-full relative z-10 px-6"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
                        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">
                            Carre<span className="text-primary italic">Adviser.</span>
                        </span>
                    </Link>
                </div>

                <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 md:p-12 text-center">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Account <span className="text-primary italic">Verification.</span>
                        </h2>
                    </div>

                    {status === 'loading' && (
                        <div className="py-8">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-primary animate-pulse" />
                                </div>
                            </div>
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                Synchronizing Protocol...
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-6"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-emerald-600 mb-2">{message}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-8">
                                Identity verified. Redirecting to secure login...
                            </p>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="py-6"
                        >
                            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-rose-500" />
                            </div>
                            <p className="text-rose-500 font-black text-sm mb-8 px-4 py-2 bg-rose-50/50 rounded-xl border border-rose-100">
                                {message}
                            </p>
                            <button
                                onClick={() => router.push('/auth?mode=login')}
                                className="btn flex items-center justify-center gap-2"
                            >
                                <ArrowRight className="w-4 h-4" />
                                Return to Console
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Identity Verification Protocol v1.4 — 2024
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
