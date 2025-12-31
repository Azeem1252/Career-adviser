'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast, ToastType } from '@/store/use-toast';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const icons: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors: Record<ToastType, string> = {
    success: 'text-emerald-500 bg-emerald-500',
    error: 'text-red-500 bg-red-500',
    info: 'text-blue-500 bg-blue-500',
    warning: 'text-amber-500 bg-amber-500',
};

export const Toaster = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-8 right-8 z-[1000] flex flex-col gap-4 pointer-events-none max-w-md">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    const colorClass = colors[toast.type];
                    const [textColor, bgColor] = colorClass.split(' ');

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, x: 50, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-start gap-4 min-w-[320px] relative overflow-hidden group">
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${textColor}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 ${textColor}`}>
                                        System::{toast.type}
                                    </div>
                                    <div className="text-sm font-bold break-words text-slate-900 dark:text-white">{toast.message}</div>
                                    {toast.action && (
                                        <button
                                            onClick={() => {
                                                toast.action?.onClick();
                                                removeToast(toast.id);
                                            }}
                                            className="mt-3 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                        >
                                            {toast.action.label}
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-muted rounded-lg transition-colors shrink-0"
                                    aria-label="Close notification"
                                >
                                    <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                                </button>

                                {toast.duration && toast.duration > 0 && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-muted/20 w-full">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: 0 }}
                                            transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                                            className={`h-full ${bgColor}`}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
