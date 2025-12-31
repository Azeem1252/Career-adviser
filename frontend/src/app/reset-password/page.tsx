'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, Rocket, ArrowRight } from 'lucide-react';
import { authService } from '@/lib/services';
import { useToast } from '@/store/use-toast';
import { validatePassword } from '@/lib/utils/validators';
import { CleanCard } from '@/components/ui/CleanCard';
import { Button } from '@/components/shared/Button';
import Link from 'next/link';

import '../auth/auth.css';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            addToast('Invalid reset link. Please request a new one.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }

        if (!validatePassword(password)) {
            addToast('Password must be at least 8 characters long', 'error');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword({ token, new_password: password });
            addToast('Password reset successfully!', 'success');
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth?mode=login');
            }, 3000);
        } catch (error: any) {
            addToast(error.response?.data?.detail || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Invalid Link</h3>
                <p className="text-slate-500 text-sm mb-8 font-medium">The link you followed is invalid or has expired.</p>
                <Link href="/auth">
                    <button className="btn">Return to Console</button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
            >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Access Restored.</h3>
                <p className="text-slate-500 font-medium text-sm mb-8">Identity verified. Redirecting to secure login...</p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-box animation" style={{ '--D': 1, '--S': 22 } as React.CSSProperties}>
                <label>New Security Key</label>
                <Lock className="icon" size={20} />
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="input-box animation" style={{ '--D': 2, '--S': 23 } as React.CSSProperties}>
                <label>Confirm Identity Key</label>
                <Lock className="icon" size={20} />
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                />
            </div>

            <div className="mt-10">
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? 'Authorizing...' : 'Reset Security Key'}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
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

                <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Secure <span className="text-primary italic">Reset.</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">
                            Define your new authorization frequency to restore portal access.
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocol Sync...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Authorization Protocol v1.4.2 — 2024
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
