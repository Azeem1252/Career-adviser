'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Briefcase,
    Building2, MapPin, Calendar, Link as LinkIcon,
    MoreVertical, ChevronRight, ArrowRight,
    Star, Clock, CheckCircle2, XCircle,
    MoreHorizontal, Loader2, ClipboardList
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { jobTrackerService } from '@/lib/services';
import type { JobApplication, JobStatus } from '@/lib/types';
import { useToast } from '@/store/use-toast';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

const STAGES: JobStatus[] = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

export default function JobTrackerPage() {
    const [jobs, setJobs] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { success, error: toastError } = useToast();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await jobTrackerService.getApplications();
            setJobs(data);
        } catch (err) {
            toastError("Failed to fetch applications.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: JobStatus) => {
        try {
            await jobTrackerService.updateApplication(id, { status: newStatus });
            setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
            success(`Status updated to ${newStatus}`);
        } catch (err) {
            toastError("Update failed.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this application?")) return;
        try {
            await jobTrackerService.deleteApplication(id);
            setJobs(jobs.filter(j => j.id !== id));
            success("Application removed.");
        } catch (err) {
            toastError("Delete failed.");
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#f8fafc] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-[1600px] mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6"
                            >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Outcome Pipeline</span>
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                                Job <span className="text-primary italic">Tracker.</span>
                            </h1>
                            <p className="mt-4 text-slate-500 text-lg font-medium max-w-xl">
                                Manage your applications, monitor status changes, and secure your next role.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search applications..."
                                    className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                            >
                                <Plus className="w-4 h-4" />
                                Log Application
                            </button>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Syncing Pipeline...</p>
                        </div>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
                            {STAGES.map(stage => (
                                <KanbanColumn
                                    key={stage}
                                    title={stage}
                                    jobs={jobs.filter(j => j.status === stage)}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Modal Placeholder (Simplified for logic) */}
                <AddJobModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={fetchJobs}
                />
            </main>
        </ProtectedRoute>
    );
}

function KanbanColumn({ title, jobs, onUpdateStatus, onDelete }: {
    title: JobStatus,
    jobs: JobApplication[],
    onUpdateStatus: (id: number, status: JobStatus) => void,
    onDelete: (id: number) => void
}) {
    const stageColor = {
        'Wishlist': 'bg-slate-400',
        'Applied': 'bg-blue-500',
        'Interviewing': 'bg-amber-500',
        'Offer': 'bg-emerald-500',
        'Rejected': 'bg-rose-500'
    }[title];

    return (
        <div className="flex-shrink-0 w-[350px] snap-center">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", stageColor)} />
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 italic">
                        {jobs.length}
                    </span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
            </div>

            <div className="space-y-4 min-h-[500px] p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <AnimatePresence>
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onUpdateStatus={onUpdateStatus}
                            onDelete={onDelete}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function JobCard({ job, onUpdateStatus, onDelete }: {
    job: JobApplication,
    onUpdateStatus: (id: number, status: JobStatus) => void,
    onDelete: (id: number) => void
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative"
        >
            <CleanCard padding="none" className="bg-white border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all overflow-hidden">
                <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="text-[13px] font-bold text-slate-900 group-hover:text-primary transition-colors">{job.job_title}</h4>
                                <p className="text-[11px] font-semibold text-slate-400 italic">{job.company_name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-slate-50 rounded-md transition-all"
                        >
                            <MoreVertical className="w-4 h-4 text-slate-300" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-300" />
                            {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-50 bg-slate-50/30"
                        >
                            <div className="p-5 space-y-4">
                                {job.notes && (
                                    <div className="text-xs font-medium text-slate-500 leading-relaxed italic">
                                        "{job.notes}"
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    {STAGES.filter(s => s !== job.status).slice(0, 2).map(stage => (
                                        <button
                                            key={stage}
                                            onClick={() => onUpdateStatus(job.id, stage)}
                                            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:border-blue-300 transition-all"
                                        >
                                            Move to {stage}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => onDelete(job.id)}
                                        className="px-3 py-2 bg-white border border-rose-100 text-rose-500 rounded-lg text-[10px] font-bold hover:bg-rose-50 transition-all col-span-2"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CleanCard>
        </motion.div>
    );
}

function AddJobModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        company_name: '',
        job_title: '',
        status: 'Wishlist' as JobStatus,
        location: '',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await jobTrackerService.createApplication(form);
            onSuccess();
            onClose();
            setForm({ company_name: '', job_title: '', status: 'Wishlist', location: '', notes: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
                <div className="p-8">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Log New Opportunity</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
                            <input
                                required
                                value={form.company_name}
                                onChange={e => setForm({ ...form, company_name: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. Anthropic, Google..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</label>
                            <input
                                required
                                value={form.job_title}
                                onChange={e => setForm({ ...form, job_title: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g. Product Designer"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value as JobStatus })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
                                <input
                                    value={form.location}
                                    onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Remote, NYC..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Logging...' : 'Add Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
