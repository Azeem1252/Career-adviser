'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon, Bell, Lock, Palette,
    Moon, Sun, Check, Shield, Database,
    ChevronRight, X, Loader2, Eye, EyeOff, Download
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useToast } from '@/store/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';
import { userService } from '@/lib/services';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { success, error: toastError, info } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        weekly: true,
    });

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Load notification preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const prefs = await userService.getNotificationPreferences();
                setNotifications(prefs);
            } catch (err) {
                console.error('Failed to load notification preferences:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadPreferences();
    }, []);

    // Handle notification toggle
    const handleNotificationToggle = async (key: 'email' | 'push' | 'weekly') => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));

        try {
            await userService.updateNotificationPreferences({ [key]: newValue });
        } catch (err) {
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
            toastError('Failed to update notification preference');
        }
    };

    // Handle password change
    const handlePasswordChange = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toastError('New passwords do not match');
            return;
        }
        if (passwordForm.new.length < 6) {
            toastError('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await userService.changePassword(passwordForm.current, passwordForm.new);
            success('Password changed successfully!');
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            toastError(err.response?.data?.detail || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle data export
    const handleDataExport = async () => {
        setIsSaving(true);
        try {
            const blob = await userService.exportUserData();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `career-adviser-data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            success('Data exported successfully!');
        } catch (err) {
            toastError('Failed to export data');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle 2FA (placeholder)
    const handle2FA = () => {
        info('Two-Factor Authentication is coming soon!');
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-slate-50/50 pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                            <SettingsIcon className="w-3.5 h-3.5" />
                            <span>System Configuration</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
                            System <span className="text-primary italic">Settings.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Configure your preferences and account settings to optimize your experience.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {/* Appearance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <CleanCard padding="none" className="bg-white border-slate-200">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                            <Palette className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Appearance</h2>
                                            <p className="text-sm text-slate-400 font-medium">Customize the visual experience</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-slate-200 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                {theme === 'dark' ? (
                                                    <Moon className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <Sun className="w-5 h-5 text-orange-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">Theme Mode</div>
                                                <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                                    Current: {theme === 'dark' ? 'Dark' : 'Light'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleTheme}
                                            className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                                        >
                                            Toggle
                                        </button>
                                    </div>
                                </div>
                            </CleanCard>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <CleanCard padding="none" className="bg-white border-slate-200">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
                                            <p className="text-sm text-slate-400 font-medium">Manage how you receive updates</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                                            { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications' },
                                            { key: 'weekly' as const, label: 'Weekly Summary', desc: 'Get a weekly progress report' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                                <div>
                                                    <div className="font-bold text-slate-900">{item.label}</div>
                                                    <div className="text-sm text-slate-400 font-medium">{item.desc}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleNotificationToggle(item.key)}
                                                    disabled={isLoading}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative border",
                                                        notifications[item.key]
                                                            ? 'bg-blue-600 border-blue-700 shadow-lg shadow-blue-500/20'
                                                            : 'bg-slate-300 border-slate-400/20 shadow-inner',
                                                        isLoading && 'opacity-50'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm border border-slate-200",
                                                        notifications[item.key] ? 'left-[26px]' : 'left-0.5'
                                                    )} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CleanCard>
                        </motion.div>

                        {/* Privacy & Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CleanCard padding="none" className="bg-white border-slate-200">
                                <div className="p-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Privacy & Security</h2>
                                            <p className="text-sm text-slate-400 font-medium">Protect your account and data</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="w-full p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-blue-600 transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-900">Change Password</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <button
                                            onClick={handle2FA}
                                            className="w-full p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-blue-600 transition-colors">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-slate-900">Two-Factor Authentication</span>
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full">Coming Soon</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                        </button>

                                        <button
                                            onClick={handleDataExport}
                                            disabled={isSaving}
                                            className="w-full p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex items-center justify-between group disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-blue-600 transition-colors">
                                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                                                </div>
                                                <span className="font-bold text-slate-900">Data Export</span>
                                            </div>
                                            <Download className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
                                        </button>
                                    </div>
                                </div>
                            </CleanCard>
                        </motion.div>
                    </div>
                </div>

                {/* Password Change Modal */}
                <AnimatePresence>
                    {showPasswordModal && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="w-full max-w-md"
                            >
                                <CleanCard padding="none" className="bg-white border-slate-200 shadow-2xl relative">
                                    <div className="p-8">
                                        <button
                                            onClick={() => setShowPasswordModal(false)}
                                            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                                <Lock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">Change Password</h3>
                                                <p className="text-sm text-slate-400 font-medium">Update your account password</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {[
                                                { key: 'current' as const, label: 'Current Password', placeholder: 'Enter current password' },
                                                { key: 'new' as const, label: 'New Password', placeholder: 'Enter new password' },
                                                { key: 'confirm' as const, label: 'Confirm Password', placeholder: 'Confirm new password' },
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-3">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-blue-600">{field.label}</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPasswords[field.key] ? 'text' : 'password'}
                                                            value={passwordForm[field.key]}
                                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                            placeholder={field.placeholder}
                                                            className="w-full p-4 pr-12 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                        >
                                                            {showPasswords[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 pt-8 mt-4">
                                            <button
                                                onClick={handlePasswordChange}
                                                disabled={isChangingPassword || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                                                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                                            </button>
                                            <button
                                                onClick={() => setShowPasswordModal(false)}
                                                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </CleanCard>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </ProtectedRoute>
    );
}
