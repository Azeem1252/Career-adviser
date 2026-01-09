'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Target, ChevronRight, CheckCircle2,
    Lock, Sparkles, Navigation, Calendar,
    Trophy, ArrowRight, BrainCircuit, Cpu,
    Milestone, Flag, BookOpen, Share2, Save, FileText, RefreshCw, Trash2, Check
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { aiService, Roadmap, RoadmapStage } from '@/lib/services';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/store/use-toast';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export default function RoadmapsPage() {
    const { user } = useAuthStore();
    const { success, error: toastError, info } = useToast();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [targetRole, setTargetRole] = useState("");
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
    const [latestAssessment, setLatestAssessment] = useState<any>(null);
    const [savingNotes, setSavingNotes] = useState<{ roadmapId: string, stageIndex: number } | null>(null);
    const [loadingTactics, setLoadingTactics] = useState<Record<number, boolean>>({});
    const [tacticalAdvice, setTacticalAdvice] = useState<Record<number, any>>({});

    useEffect(() => {
        fetchRoadmaps();
        loadAssessment();
    }, []);

    const loadAssessment = async () => {
        try {
            const data = await aiService.getLatestAssessment();
            setLatestAssessment(data);
        } catch (err) {
            console.error("Failed to load assessment for roadmaps:", err);
        }
    };

    const fetchRoadmaps = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            console.log('Fetching roadmaps...');
            const data = await aiService.getRoadmaps();
            setRoadmaps(data);

            if (data.length > 0) {
                if (!selectedRoadmap) {
                    setSelectedRoadmap(data[0]);
                } else {
                    // Sync the currently selected roadmap with fresh data (type-safe comparison)
                    const updated = data.find(r => String(r.id) === String(selectedRoadmap.id));
                    if (updated) setSelectedRoadmap(updated);
                }
            }
        } catch (err: any) {
            console.error('Error fetching roadmaps:', err);
            toastError(err.response?.data?.message || 'Failed to load roadmaps');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole) return;
        setGenerating(true);
        info("Synthesizing strategic roadmap...");
        try {
            const newRoadmap = await aiService.generateRoadmap({
                current_profile: user?.profile_summary || "Professional",
                target_career: targetRole
            });
            setRoadmaps([newRoadmap, ...roadmaps]);
            setSelectedRoadmap(newRoadmap);
            success("Strategic roadmap generated.");
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.detail || "Roadmap synthesis failed.";
            toastError(message);
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveNotes = async (roadmapId: string, stageIndex: number, notes: string) => {
        // Update local state immediately for instant feedback and to prevent race conditions
        setRoadmaps(prev => prev.map(rm => {
            if (String(rm.id) === String(roadmapId)) {
                const newStages = [...(rm.stages || [])];
                if (newStages[stageIndex]) {
                    newStages[stageIndex] = { ...newStages[stageIndex], notes };
                }
                return { ...rm, stages: newStages };
            }
            return rm;
        }));

        if (selectedRoadmap && String(selectedRoadmap.id) === String(roadmapId)) {
            setSelectedRoadmap(prev => {
                if (!prev) return null;
                const newStages = [...(prev.stages || [])];
                if (newStages[stageIndex]) {
                    newStages[stageIndex] = { ...newStages[stageIndex], notes };
                }
                return { ...prev, stages: newStages };
            });
        }

        setSavingNotes({ roadmapId, stageIndex });
        try {
            // Convert string ID to number for backend API
            await aiService.updateStageNotes(Number(roadmapId), stageIndex, notes);
            success("Strategy notes synchronized.");
        } catch (err) {
            console.error(err);
            toastError("Failed to save notes.");
        } finally {
            setSavingNotes(null);
        }
    };

    const handleShare = () => {
        if (!selectedRoadmap) return;
        const text = `Check out my career roadmap for ${selectedRoadmap.title} on CarreAdviser!`;
        if (navigator.share) {
            navigator.share({ title: 'Career Roadmap', text: text, url: window.location.href });
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.href}`);
            success("Roadmap link copied to clipboard.");
        }
    };

    const handleToggleSkill = async (roadmapId: string, stageIndex: number, skillName: string) => {
        // Optimistic UI update
        const updateLocalState = (prev: Roadmap[]) => prev.map(rm => {
            if (String(rm.id) === String(roadmapId)) {
                const newStages = [...(rm.stages || [])];
                const stage = newStages[stageIndex];
                if (stage) {
                    const currentCompleted = stage.completed_skills || [];
                    const isCompleted = currentCompleted.includes(skillName);
                    newStages[stageIndex] = {
                        ...stage,
                        completed_skills: isCompleted
                            ? currentCompleted.filter(s => s !== skillName)
                            : [...currentCompleted, skillName]
                    };
                }
                return { ...rm, stages: newStages };
            }
            return rm;
        });

        setRoadmaps(updateLocalState);
        if (selectedRoadmap && String(selectedRoadmap.id) === String(roadmapId)) {
            setSelectedRoadmap(prev => {
                if (!prev) return null;
                const newStages = [...(prev.stages || [])];
                const stage = newStages[stageIndex];
                if (stage) {
                    const currentCompleted = stage.completed_skills || [];
                    const isCompleted = currentCompleted.includes(skillName);
                    newStages[stageIndex] = {
                        ...stage,
                        completed_skills: isCompleted
                            ? currentCompleted.filter(s => s !== skillName)
                            : [...currentCompleted, skillName]
                    };
                }
                return { ...prev, stages: newStages };
            });
        }

        try {
            await aiService.toggleSkillCompletion(Number(roadmapId), stageIndex, skillName);
            // Refresh silently to sync with server (handles any server-side logic like auto-completing stage)
            await fetchRoadmaps(true);
        } catch (err) {
            console.error('Skill toggle error:', err);
            toastError("Failed to update milestone status.");
            // Revert on error? Skipping for simplicity unless requested
        }
    };

    const handleToggleResource = async (roadmapId: string, stageIndex: number, resourceName: string) => {
        // Optimistic UI update
        const updateLocalState = (prev: Roadmap[]) => prev.map(rm => {
            if (String(rm.id) === String(roadmapId)) {
                const newStages = [...(rm.stages || [])];
                const stage = newStages[stageIndex];
                if (stage) {
                    const currentCompleted = stage.completed_resources || [];
                    const isCompleted = currentCompleted.includes(resourceName);
                    newStages[stageIndex] = {
                        ...stage,
                        completed_resources: isCompleted
                            ? currentCompleted.filter(r => r !== resourceName)
                            : [...currentCompleted, resourceName]
                    };
                }
                return { ...rm, stages: newStages };
            }
            return rm;
        });

        setRoadmaps(updateLocalState);
        if (selectedRoadmap && String(selectedRoadmap.id) === String(roadmapId)) {
            setSelectedRoadmap(prev => {
                if (!prev) return null;
                const newStages = [...(prev.stages || [])];
                const stage = newStages[stageIndex];
                if (stage) {
                    const currentCompleted = stage.completed_resources || [];
                    const isCompleted = currentCompleted.includes(resourceName);
                    newStages[stageIndex] = {
                        ...stage,
                        completed_resources: isCompleted
                            ? currentCompleted.filter(r => r !== resourceName)
                            : [...currentCompleted, resourceName]
                    };
                }
                return { ...prev, stages: newStages };
            });
        }

        try {
            await aiService.toggleResourceCompletion(Number(roadmapId), stageIndex, resourceName);
            await fetchRoadmaps(true);
        } catch (err) {
            console.error('Resource toggle error:', err);
            toastError("Failed to update resource status.");
        }
    };

    const handleGenerateTactics = async (roadmapId: string, stageIndex: number) => {
        setLoadingTactics(prev => ({ ...prev, [stageIndex]: true }));
        info("Synthesizing tactical insights...");
        try {
            const advice = await aiService.getTacticalAdvice(roadmapId, stageIndex);
            setTacticalAdvice(prev => ({ ...prev, [stageIndex]: advice }));
            success("Tactical insights generated.");
        } catch (err) {
            console.error(err);
            toastError("Tactical synthesis failed.");
        } finally {
            setLoadingTactics(prev => ({ ...prev, [stageIndex]: false }));
        }
    };

    const toggleStageComplete = async (roadmapId: string, stageIndex: number) => {
        try {
            // Convert string ID to number for backend API
            await aiService.toggleStageCompletion(Number(roadmapId), stageIndex);
            // Refresh roadmaps to get updated data silently to prevent flicker
            await fetchRoadmaps(true);
            success("Stage status updated.");
        } catch (err: any) {
            console.error('Toggle stage error detailed:', {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data,
                config: err.config
            });
            if (err.response?.status === 422) {
                toastError(`Invalid stage data: ${JSON.stringify(err.response.data?.detail || 'Validation error')}`);
            } else {
                toastError("Failed to synchronize progress.");
            }
        }
    };

    const [deletingRoadmapId, setDeletingRoadmapId] = useState<string | null>(null);

    const handleDeleteRoadmap = async (roadmapId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the roadmap when clicking delete

        // Two-step deletion process
        if (deletingRoadmapId !== roadmapId) {
            setDeletingRoadmapId(roadmapId);
            info('Click delete again to confirm removal.');

            // Reset after 3 seconds
            setTimeout(() => setDeletingRoadmapId(null), 3000);
            return;
        }

        try {
            // Convert string ID to number for backend API
            await aiService.deleteRoadmap(Number(roadmapId));
            setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
            if (selectedRoadmap?.id === roadmapId) {
                const remaining = roadmaps.filter(r => r.id !== roadmapId);
                setSelectedRoadmap(remaining.length > 0 ? remaining[0] : null);
            }
            setDeletingRoadmapId(null);
            success('Roadmap deleted successfully.');
        } catch (err) {
            console.error('Delete roadmap error:', err);
            toastError('Failed to delete roadmap.');
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[var(--bg)] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-[1280px] mx-auto">

                    {loading ? (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <div className="text-center">
                                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                                <p className="text-slate-600 font-medium">Loading roadmaps...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header Section */}
                            <div className="mb-8">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-medium uppercase tracking-wider mb-3">
                                            <Milestone className="w-3 h-3" />
                                            <span>Strategic Trajectories</span>
                                        </div>
                                        <h1 className="text-[28px] md:text-[36px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
                                            Career <span className="text-primary">Roadmaps</span>
                                        </h1>
                                        <p className="max-w-2xl text-slate-500 text-[13px] font-medium leading-relaxed">
                                            Transform complex career objectives into actionable milestones with AI-powered strategic planning.
                                        </p>
                                    </div>

                                    {/* Statistics Dashboard */}
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Roadmaps</div>
                                            <div className="text-2xl font-black text-blue-600">{roadmaps.length}</div>
                                        </div>
                                        <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Progress</div>
                                            <div className="text-2xl font-black text-green-600">
                                                {roadmaps.length > 0
                                                    ? Math.round(roadmaps.reduce((acc, rm) => acc + ((rm.stages?.filter(s => s.completed).length / (rm.stages?.length || 1)) * 100), 0) / roadmaps.length)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* Control Panel */}
                                <div className="lg:col-span-4 space-y-5">
                                    <CleanCard padding="p-5" className="bg-white">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                                <Zap className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-[16px] font-bold text-slate-900">Generate Roadmap</h3>
                                        </div>
                                        <form onSubmit={handleGenerate} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Role</label>
                                                <input
                                                    type="text"
                                                    value={targetRole}
                                                    onChange={(e) => setTargetRole(e.target.value)}
                                                    placeholder="e.g. Senior AI Engineer"
                                                    className="w-full h-[38px] bg-slate-50 border border-slate-200 px-3 rounded-lg text-[13px] text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-150"
                                                />

                                                {latestAssessment?.recommended_roles && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {latestAssessment.recommended_roles.slice(0, 3).map((role: any) => (
                                                            <button
                                                                key={role.title}
                                                                type="button"
                                                                onClick={() => setTargetRole(role.title)}
                                                                className={cn(
                                                                    "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border",
                                                                    targetRole === role.title
                                                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                                        : "bg-blue-50 border-blue-100 text-blue-700 hover:border-blue-300"
                                                                )}
                                                            >
                                                                {role.title}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty Level</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            onClick={() => setDifficulty(level)}
                                                            className={cn(
                                                                "px-3 py-2 rounded-lg border text-[11px] font-medium transition-all duration-150",
                                                                difficulty === level
                                                                    ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                                    : "border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                                                            )}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={generating || !targetRole.trim()}
                                                className="w-full h-[38px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[13px] shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                {generating ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-4 h-4" />
                                                        Generate Roadmap
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </CleanCard>

                                    <section className="space-y-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Your Roadmaps ({roadmaps.length})</div>
                                        {roadmaps.length === 0 ? (
                                            <div className="p-6 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                <Navigation className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                                <p className="text-[12px] font-medium text-slate-400">No roadmaps yet</p>
                                                <p className="text-[11px] text-slate-400 mt-1">Generate your first roadmap above</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {roadmaps.map(rm => (
                                                    <div
                                                        key={rm.id}
                                                        onClick={() => setSelectedRoadmap(rm)}
                                                        className={cn(
                                                            "w-full p-3 rounded-lg border text-left transition-all duration-150 flex items-center justify-between group cursor-pointer",
                                                            selectedRoadmap?.id === rm.id
                                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                                                        )}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                setSelectedRoadmap(rm);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <div className="font-semibold truncate text-[14px] mb-1">{rm.title}</div>
                                                            <div className="text-[11px] opacity-70 truncate">
                                                                {(() => {
                                                                    const extracted = rm.title.match(/to (.*?) Career Roadmap/i)?.[1];
                                                                    return rm.target_career || extracted || rm.duration || `${rm.difficulty} Level`;
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className={cn("h-1 flex-1 rounded-full overflow-hidden", selectedRoadmap?.id === rm.id ? "bg-white/20" : "bg-slate-100")}>
                                                                    <div
                                                                        className={cn("h-full transition-all duration-500", selectedRoadmap?.id === rm.id ? "bg-white" : "bg-blue-600")}
                                                                        style={{ width: `${rm.progress?.completion_percentage ?? (rm.stages?.filter(s => s.completed).length / (rm.stages?.length || 1)) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[11px] font-medium">{rm.progress?.completion_percentage ?? Math.round((rm.stages?.filter(s => s.completed).length / (rm.stages?.length || 1)) * 100)}%</span>
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleDeleteRoadmap(rm.id, e)}
                                                                className={cn(
                                                                    "p-1.5 rounded-md transition-all duration-150",
                                                                    deletingRoadmapId === rm.id
                                                                        ? "bg-red-100 text-red-600 animate-pulse"
                                                                        : selectedRoadmap?.id === rm.id
                                                                            ? "hover:bg-white/20 text-white/70 hover:text-white"
                                                                            : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                                                                )}
                                                                title={deletingRoadmapId === rm.id ? "Click again to confirm" : "Delete roadmap"}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Roadmap Visualizer */}
                                <div className="lg:col-span-8">
                                    <AnimatePresence mode="wait">
                                        {selectedRoadmap ? (
                                            <motion.div
                                                key={selectedRoadmap.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="relative"
                                            >
                                                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                                    <div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                                                            <Trophy className="w-3 h-3" /> Mission Critical Path
                                                        </div>
                                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">{selectedRoadmap.title}</h2>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Duration</div>
                                                            <div className="text-xs font-bold text-blue-600 flex items-center justify-end gap-2">
                                                                <Zap className="w-3 h-3" />
                                                                {selectedRoadmap.duration || 'Flexible'}
                                                            </div>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</div>
                                                            <div className="text-xs font-bold text-slate-700 flex items-center justify-end gap-2">
                                                                <Calendar className="w-3 h-3 text-blue-600" />
                                                                {selectedRoadmap.created_at && !isNaN(new Date(selectedRoadmap.created_at).getTime())
                                                                    ? new Date(selectedRoadmap.created_at).toLocaleDateString()
                                                                    : 'N/A'}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={handleShare}
                                                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Stages Timeline */}
                                                <div className="relative pl-8 md:pl-10 border-l-2 border-slate-200 space-y-6">
                                                    {selectedRoadmap?.stages?.map((stage: RoadmapStage, idx: number) => (
                                                        <motion.div
                                                            key={`${idx}-${stage.title}`}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="relative"
                                                        >
                                                            {/* Timeline Node */}
                                                            <div className="absolute -left-[9px] md:-left-[11px] top-2 flex flex-col items-center">
                                                                <button
                                                                    onClick={() => toggleStageComplete(selectedRoadmap.id, idx)}
                                                                    className={cn(
                                                                        "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-150 z-10 shadow-sm",
                                                                        stage.completed
                                                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                                            : "bg-white border-slate-200 hover:border-blue-400 text-slate-300 hover:text-blue-600"
                                                                    )}
                                                                >
                                                                    {stage.completed ? <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                                                                </button>
                                                            </div>

                                                            <CleanCard
                                                                padding="none"
                                                                className={cn(
                                                                    "overflow-hidden transition-all duration-300 bg-white",
                                                                    stage.completed ? "opacity-60 saturate-[0.8] border-blue-200 shadow-[0_0_20px_rgba(37,99,235,0.1)]" : "hover:shadow-lg hover:border-blue-100"
                                                                )}
                                                            >
                                                                <div className="p-5">
                                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-blue-600 text-[11px] font-medium uppercase tracking-wider">Phase {idx + 1}</span>
                                                                                {stage.completed && <span className="text-[11px] font-medium uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Completed</span>}
                                                                            </div>
                                                                            <h3 className="text-[18px] font-semibold text-slate-900 leading-tight">{stage.title}</h3>
                                                                        </div>
                                                                        {stage.duration && (
                                                                            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                                                {stage.duration}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-slate-500 text-[14px] font-medium leading-relaxed mb-6 max-w-3xl">
                                                                        {stage.description}
                                                                    </p>

                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <Cpu className="w-4 h-4 text-blue-600" />
                                                                                <h4 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Skills to Master</h4>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                {(() => {
                                                                                    const skillsArray = stage.skills_to_master || stage.skills;
                                                                                    return skillsArray && skillsArray.length > 0 ? (
                                                                                        skillsArray.map((skill: string, i: number) => {
                                                                                            const isCompleted = stage.completed_skills?.includes(skill);
                                                                                            return (
                                                                                                <button
                                                                                                    key={`${i}-${skill}`}
                                                                                                    onClick={() => handleToggleSkill(selectedRoadmap.id, idx, skill)}
                                                                                                    className={cn(
                                                                                                        "group/skill w-full flex items-start gap-4 p-4 rounded-[1.25rem] border transition-all duration-300 text-left relative overflow-hidden",
                                                                                                        isCompleted
                                                                                                            ? "bg-blue-600/5 border-blue-200 shadow-sm"
                                                                                                            : "bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50/30 shadow-sm"
                                                                                                    )}
                                                                                                >
                                                                                                    {isCompleted && <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />}
                                                                                                    <div className={cn(
                                                                                                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300",
                                                                                                        isCompleted
                                                                                                            ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                                                                                            : "bg-white border-slate-200 text-transparent group-hover/skill:border-blue-400"
                                                                                                    )}>
                                                                                                        <Check className="w-4 h-4 stroke-[3]" />
                                                                                                    </div>
                                                                                                    <div className="flex-1 min-w-0">
                                                                                                        <span className={cn(
                                                                                                            "text-[13px] font-bold tracking-tight block transition-colors duration-300",
                                                                                                            isCompleted ? "text-blue-900" : "text-slate-700 group-hover/skill:text-blue-700"
                                                                                                        )}>{skill}</span>
                                                                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                                                                            <div className={cn(
                                                                                                                "w-1.5 h-1.5 rounded-full",
                                                                                                                isCompleted ? "bg-blue-500" : "bg-slate-300"
                                                                                                            )} />
                                                                                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 opacity-60">Competency Milestone</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </button>
                                                                                            );
                                                                                        })
                                                                                    ) : (
                                                                                        <p className="text-[12px] text-slate-400 italic">No skills specified for this stage</p>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                                                                <h4 className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Resources</h4>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                {stage.resources?.map((res: string, i: number) => {
                                                                                    const isCompleted = stage.completed_resources?.includes(res);
                                                                                    const isUrl = res.toLowerCase().startsWith('http');
                                                                                    return (
                                                                                        <div
                                                                                            key={`${i}-${res}`}
                                                                                            className={cn(
                                                                                                "group/res p-4 rounded-[1.25rem] border transition-all duration-300 flex items-start gap-4 shadow-sm",
                                                                                                isCompleted
                                                                                                    ? "bg-indigo-50/50 border-indigo-200"
                                                                                                    : "bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30"
                                                                                            )}
                                                                                        >
                                                                                            <button
                                                                                                onClick={() => handleToggleResource(selectedRoadmap.id, idx, res)}
                                                                                                className={cn(
                                                                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300",
                                                                                                    isCompleted
                                                                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]"
                                                                                                        : "bg-white border-slate-200 text-transparent hover:border-indigo-400 group-hover/res:border-indigo-400"
                                                                                                )}
                                                                                            >
                                                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                                                            </button>

                                                                                            <div className="flex-1 min-w-0">
                                                                                                <a
                                                                                                    href={isUrl ? res : undefined}
                                                                                                    target={isUrl ? "_blank" : undefined}
                                                                                                    rel={isUrl ? "noopener noreferrer" : undefined}
                                                                                                    className={cn(
                                                                                                        "text-[13px] font-bold leading-tight mb-2 block transition-all",
                                                                                                        isCompleted ? "text-indigo-900/40 line-through" : "text-slate-700 hover:text-indigo-600"
                                                                                                    )}
                                                                                                >
                                                                                                    {res}
                                                                                                </a>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
                                                                                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Research Node</span>
                                                                                                    </div>
                                                                                                    {isUrl && <ArrowRight className="w-3 h-3 text-indigo-300 group-hover/res:translate-x-1 transition-transform" />}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-8 border-t border-slate-100">
                                                                        <div className="flex items-center justify-between mb-4">
                                                                            <div className="flex items-center gap-2.5">
                                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                                                    <FileText className="w-4 h-4" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="text-[12px] font-bold text-slate-800 leading-none mb-1">Strategic Intelligence Log</h4>
                                                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Neural Progress Archiving</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <AnimatePresence>
                                                                                    {savingNotes?.roadmapId === selectedRoadmap.id && savingNotes?.stageIndex === idx && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, x: 10 }}
                                                                                            animate={{ opacity: 1, x: 0 }}
                                                                                            exit={{ opacity: 0, x: 10 }}
                                                                                            className="flex items-center gap-1.5 text-blue-600"
                                                                                        >
                                                                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Syncing...</span>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>

                                                                                <button
                                                                                    onClick={() => handleGenerateTactics(selectedRoadmap.id, idx)}
                                                                                    disabled={loadingTactics[idx]}
                                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                                                                                >
                                                                                    {loadingTactics[idx] ? (
                                                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                                                    ) : (
                                                                                        <Sparkles className="w-3 h-3 text-blue-400" />
                                                                                    )}
                                                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Neural Tactics</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        <AnimatePresence>
                                                                            {tacticalAdvice[idx] && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                    className="mb-8 p-8 rounded-[2.5rem] bg-slate-950 border border-white/10 shadow-2xl relative overflow-hidden group/tactics"
                                                                                >
                                                                                    {/* Neural Glow Effects */}
                                                                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
                                                                                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />

                                                                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/tactics:opacity-[0.07] transition-opacity duration-700">
                                                                                        <BrainCircuit className="w-40 h-40" />
                                                                                    </div>

                                                                                    <div className="relative z-10">
                                                                                        <div className="flex items-center gap-3 mb-6">
                                                                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                                                                <Sparkles className="w-5 h-5 text-white" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80 block mb-0.5">Neural Synthesis</span>
                                                                                                <h5 className="text-xl font-black text-white tracking-tight">AI Strategic Insight</h5>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="mb-8">
                                                                                            <div className="flex items-center gap-2 mb-4 ml-1">
                                                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                                                                                <h6 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Tactical Overview</h6>
                                                                                            </div>
                                                                                            <p className="text-[15px] leading-relaxed text-slate-200 font-medium bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden group/overview transition-all">
                                                                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent opacity-50" />
                                                                                                {tacticalAdvice[idx].tactical_overview}
                                                                                            </p>
                                                                                        </div>

                                                                                        <div className="grid md:grid-cols-2 gap-6">
                                                                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 group/item">
                                                                                                <div className="flex items-center gap-3 mb-4">
                                                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                                                        <Target className="w-4 h-4 text-blue-400" />
                                                                                                    </div>
                                                                                                    <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Immediate Actions</h6>
                                                                                                </div>
                                                                                                <ul className="space-y-3">
                                                                                                    {tacticalAdvice[idx].immediate_actions.map((action: string, i: number) => (
                                                                                                        <li key={i} className="flex gap-3 text-[13px] text-slate-300 font-medium leading-relaxed group/action">
                                                                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shadow-[0_0_8px_rgba(59,130,246,0.6)] group-hover/action:scale-125 transition-transform" />
                                                                                                            {action}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all duration-300 group/pitfall">
                                                                                                <div className="flex items-center gap-3 mb-4">
                                                                                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                                                                        <Zap className="w-4 h-4 text-orange-400" />
                                                                                                    </div>
                                                                                                    <h6 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Common Pitfalls</h6>
                                                                                                </div>
                                                                                                <ul className="space-y-3">
                                                                                                    {tacticalAdvice[idx].common_pitfalls.map((pitfall: string, i: number) => (
                                                                                                        <li key={i} className="flex gap-3 text-[13px] text-slate-300 font-medium leading-relaxed group/pitem">
                                                                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shadow-[0_0_8px_rgba(249,115,22,0.6)] group-hover/pitem:scale-125 transition-transform" />
                                                                                                            {pitfall}
                                                                                                        </li>
                                                                                                    ))}
                                                                                                </ul>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="mt-8 pt-7 border-t border-white/5 flex items-center gap-5">
                                                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                                                                <Trophy className="w-7 h-7 text-yellow-400 drop-shadow-glow" />
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <p className="text-[10px] uppercase font-black tracking-[0.25em] text-yellow-500/60 mb-1.5">Expert Execution Strategy</p>
                                                                                                <p className="text-sm font-bold italic text-white leading-relaxed">"{tacticalAdvice[idx].expert_tip}"</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>

                                                                        <div className="relative group/notes" key={`${selectedRoadmap.id}-${idx}`}>
                                                                            <textarea
                                                                                defaultValue={stage.notes || ""}
                                                                                onBlur={(e) => handleSaveNotes(selectedRoadmap.id, idx, e.target.value)}
                                                                                placeholder="Document your strategic breakthroughs, blockers, or execution details for this phase..."
                                                                                className="w-full bg-slate-50/30 border border-slate-200 rounded-2xl p-5 text-[14px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/5 transition-all min-h-[160px] resize-none leading-relaxed shadow-inner"
                                                                            />
                                                                            <div className="absolute top-4 right-4 text-slate-200">
                                                                                <BrainCircuit className="w-5 h-5 opacity-10" />
                                                                            </div>
                                                                            <div className="absolute bottom-4 right-5 flex items-center gap-3">
                                                                                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-focus-within/notes:opacity-100 transition-opacity">
                                                                                    Auto-Sync on blur
                                                                                </div>
                                                                                <div className="p-1.5 rounded-lg bg-white border border-slate-100 shadow-sm opacity-20 group-focus-within/notes:opacity-100 transition-opacity text-blue-600">
                                                                                    <Save className="w-3.5 h-3.5" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CleanCard>
                                                        </motion.div>
                                                    ))}

                                                    {/* Final Goal */}
                                                    <div className="relative" key="final-goal">
                                                        <div className="absolute -left-[12px] md:-left-[18px] top-0">
                                                            <div className="w-6 h-6 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 border-4 border-white flex items-center justify-center shadow-xl shadow-blue-500/40">
                                                                <Flag className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl">
                                                            <h3 className="text-lg font-black text-blue-900 tracking-tight mb-2">Ultimate Objective</h3>
                                                            <p className="text-[13px] font-bold text-blue-700/80">Full trajectory completion and mastery achieved.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div key="no-roadmap" className="h-[500px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                    <Navigation className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 mb-2">No Roadmap Selected</h3>
                                                <p className="text-slate-400 font-medium text-[13px]">Select a roadmap from the list or generate a new one to begin.</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                        </>
                    )}

                </div>
            </main >
        </ProtectedRoute >
    );
}
