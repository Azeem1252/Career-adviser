'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/10 border border-slate-100 text-center"
                >
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-8">
                        <Mail className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                        Check Your Inbox
                    </h1>

                    <p className="text-slate-600 font-medium leading-relaxed mb-10">
                        We've sent a verification link to your email address. Please click the link to activate your account and start your career journey.
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900">Email Sent</div>
                                <div className="text-xs text-slate-500 font-medium">Check your spam folder if not found.</div>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900">One-click Activation</div>
                                <div className="text-xs text-slate-500 font-medium">Link expires in 24 hours.</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-100">
                        <Link href="/auth?mode=login">
                            <button className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors mx-auto group">
                                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                                Return to Login
                            </button>
                        </Link>
                    </div>
                </motion.div>

                <p className="text-center mt-8 text-sm text-slate-400 font-medium">
                    Didn't receive the email? <button className="text-blue-600 font-bold hover:underline">Resend Verification</button>
                </p>
            </div>
        </main>
    );
}
