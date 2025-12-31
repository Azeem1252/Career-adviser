'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User as UserIcon, Mail, MapPin, Briefcase, Save, Loader2, Plus,
    Trash2, Link as LinkIcon, ExternalLink, Calendar, GraduationCap,
    Github, Linkedin, Globe, Shield, Zap, Award, Target, Cpu, X, Sparkles,
    ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { userService } from '@/lib/services';
import type { UserProject, UserCertification, User } from '@/lib/types';
import { Skeleton } from '@/components/skeleton';
import { useToast } from '@/store/use-toast';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user, checkAuth, setUser } = useAuthStore();
    const { success, error: toastError } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showCertForm, setShowCertForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'identity' | 'trajectory' | 'neural'>('identity');
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        skills: [] as string[]
    });
    const [newSkill, setNewSkill] = useState('');

    const [newProject, setNewProject] = useState<Partial<UserProject>>({
        title: '',
        description: '',
        link: '',
        technologies: ''
    });

    const [newCert, setNewCert] = useState<Partial<UserCertification>>({
        name: '',
        issuing_organization: '',
        credential_id: '',
        credential_url: ''
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number, type: 'project' | 'certification' } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                linkedin: user.linkedin || '',
                github: user.github || '',
                website: user.website || '',
                skills: user.skills || []
            });
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            await userService.uploadAvatar(file);
            await checkAuth(true);
            success("Profile image updated.");
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            toastError("Avatar uplink failed.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await userService.updateProfile(formData);
            await checkAuth(true); // Force refetch to sync all fields including new ones
            setIsEditing(false);
            success("Identity parameters synchronized.");
        } catch (error) {
            console.error('Failed to update profile:', error);
            toastError("Synchronization failed. Check neural link.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddProject = async () => {
        try {
            await userService.addProject(newProject);
            await checkAuth(true);
            setNewProject({ title: '', description: '', link: '', technologies: '' });
            setShowProjectForm(false);
            success("New project deployment indexed.");
        } catch (error) {
            console.error('Failed to add project:', error);
            toastError("Deployment indexing failed.");
        }
    };

    const handleDeleteProject = (id: number) => {
        setDeleteConfirm({ id, type: 'project' });
    };

    const executeDeleteProject = async (id: number) => {
        try {
            await userService.deleteProject(id);
            await checkAuth(true);
            success("Project decommissioned successfully.");
        } catch (error) {
            console.error('Failed to delete project:', error);
            toastError("Decommissioning failed.");
        }
    };

    const handleAddCert = async () => {
        try {
            await userService.addCertification(newCert);
            await checkAuth(true);
            setNewCert({ name: '', issuing_organization: '', credential_id: '', credential_url: '' });
            setShowCertForm(false);
            success("New validation entry authorized.");
        } catch (error) {
            console.error('Failed to add certification:', error);
            toastError("Authorization failed.");
        }
    };

    const handleDeleteCert = (id: number) => {
        setDeleteConfirm({ id, type: 'certification' });
    };

    const executeDeleteCert = async (id: number) => {
        try {
            await userService.deleteCertification(id);
            await checkAuth(true);
            success("Certification removed from registry.");
        } catch (error) {
            console.error('Failed to delete certification:', error);
            toastError("Removal failed.");
        }
    };

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(newSkill.trim())) {
                setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillToRemove) });
    };

    const calculateProfileStrength = () => {
        if (!user) return 0;
        let points = 0;
        if (user.name) points += 10;
        if (user.bio) points += 20;
        if (user.location) points += 10;
        if (user.skills && user.skills.length > 0) points += 20;
        if (user.projects && user.projects.length > 0) points += 20;
        if (user.certifications && user.certifications.length > 0) points += 20;
        return points;
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-background pt-16 md:pt-20 lg:pt-24 pb-10 md:pb-16 px-4 md:px-6">
                <div className="max-w-5xl mx-auto space-y-5 md:space-y-6 lg:space-y-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Secure Identity Module 1.0</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
                                Professional <span className="text-primary italic">Cockpit.</span>
                            </h1>
                            <p className="max-w-xl text-slate-500 text-lg font-medium leading-relaxed">
                                Architect your professional identity. Synchronize your skills, achievements, and technical trajectory with the ecosystem.
                            </p>
                        </div>

                        {/* Profile Strength Gauge */}
                        <div className="relative w-32 h-32 shrink-0 group">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="50%" cy="50%" r="45%"
                                    className="fill-none stroke-slate-100 stroke-[8]"
                                />
                                <motion.circle
                                    cx="50%" cy="50%" r="45%"
                                    className="fill-none stroke-primary stroke-[8]"
                                    strokeDasharray="100 100"
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 100 - calculateProfileStrength() }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">{calculateProfileStrength()}%</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Integrity</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tab Switcher */}
                    <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                        <TabButton
                            active={activeTab === 'identity'}
                            onClick={() => setActiveTab('identity')}
                            icon={<UserIcon className="w-4 h-4" />}
                            label="Identity"
                        />
                        <TabButton
                            active={activeTab === 'trajectory'}
                            onClick={() => setActiveTab('trajectory')}
                            icon={<Target className="w-4 h-4" />}
                            label="Trajectory"
                        />
                        <TabButton
                            active={activeTab === 'neural'}
                            onClick={() => setActiveTab('neural')}
                            icon={<Cpu className="w-4 h-4" />}
                            label="Neural Core"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'identity' && (
                            <motion.div
                                key="identity"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                            >
                                <div className="lg:col-span-1 space-y-8">
                                    <CleanCard padding="none" className="bg-white border-slate-200 text-center">
                                        <div className="p-8">
                                            <div className="relative inline-block mb-6">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                <div className="w-32 h-32 rounded-[2.5rem] bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden relative group">
                                                    {user?.avatar_url ? (
                                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <UserIcon className="w-12 h-12 text-blue-600" />
                                                    )}
                                                    {isSaving && (
                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleAvatarClick}
                                                    className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 transition-transform"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h2>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{user?.email}</p>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="w-full py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                            >
                                                RECONFIGURE IDENTITY
                                            </button>
                                        </div>
                                    </CleanCard>

                                    <CleanCard padding="none" className="bg-white border-slate-200">
                                        <div className="p-8 space-y-6">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2">Connectivity</h3>
                                            <SocialLink icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" value={user?.linkedin} />
                                            <SocialLink icon={<Github className="w-4 h-4" />} label="GitHub" value={user?.github} />
                                            <SocialLink icon={<Globe className="w-4 h-4" />} label="Website" value={user?.website} />
                                        </div>
                                    </CleanCard>
                                </div>

                                <div className="lg:col-span-2 space-y-8">
                                    <CleanCard padding="none" className="bg-white border-slate-200 relative overflow-hidden group min-h-[320px] flex flex-col justify-center">
                                        <div className="p-10 md:p-12 relative z-10">
                                            <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                                                <Shield className="w-64 h-64" />
                                            </div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-8 flex items-center gap-2">
                                                <Zap className="w-4 h-4" /> Professional Directive
                                            </h3>
                                            <p className="text-2xl md:text-3xl font-bold leading-tight text-slate-700 italic">
                                                "{user?.bio || 'Strategic career advisor with expertise in career planning.'}"
                                            </p>
                                            <div className="mt-12 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                {user?.location || 'STRATEGIC LOCATION UNDEFINED'}
                                            </div>
                                        </div>
                                    </CleanCard>

                                    <div className="grid grid-cols-2 gap-8">
                                        <StatBox icon={<Briefcase className="w-5 h-5 text-blue-600" />} val={user?.projects?.length || 0} label="Projects" border="blue" />
                                        <StatBox icon={<GraduationCap className="w-5 h-5 text-indigo-600" />} val={user?.certifications?.length || 0} label="Certs" border="indigo" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'trajectory' && (
                            <motion.div
                                key="trajectory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                {/* Projects Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                                <Briefcase className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">Project Matrix</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical deployments and builds</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowProjectForm(!showProjectForm)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {showProjectForm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-10"
                                        >
                                            <CleanCard padding="p-8 md:p-10" className="bg-white border-blue-100 shadow-xl shadow-blue-500/5 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <InputField label="Project Title" value={newProject.title || undefined} onChange={v => setNewProject({ ...newProject, title: v })} />
                                                    <InputField label="Technical Stack" value={newProject.technologies || undefined} onChange={v => setNewProject({ ...newProject, technologies: v })} placeholder="React, Node.js, etc." />
                                                </div>
                                                <InputField label="Deployment Link" value={newProject.link || undefined} onChange={v => setNewProject({ ...newProject, link: v })} placeholder="https://..." />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Operation Summary</label>
                                                    <textarea
                                                        value={newProject.description || ''}
                                                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 min-h-[120px]"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={handleAddProject} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Execute Add</button>
                                                    <button onClick={() => setShowProjectForm(false)} className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                                                </div>
                                            </CleanCard>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {user?.projects?.map(project => (
                                            <CleanCard key={project.id} padding="p-8" className="bg-white border-slate-100 hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col">
                                                <button
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <h4 className="text-xl font-bold text-slate-900 mb-4 pr-10">{project.title}</h4>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">{project.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                                    {project.technologies?.split(',').map((tech, i) => (
                                                        <span key={i} className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                                                            {tech.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                                {project.link && (
                                                    <a href={project.link} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:gap-3 transition-all">
                                                        Access Deployment <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </CleanCard>
                                        ))}
                                        {(!user?.projects || user.projects.length === 0) && (
                                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 opacity-60">
                                                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-400" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Projects Synchronized</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Certifications Section */}
                                <section>
                                    <div className="flex justify-between items-center mb-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900">Validations</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trusted professional credentials</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowCertForm(!showCertForm)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {showCertForm && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-10"
                                        >
                                            <CleanCard padding="p-8 md:p-10" className="bg-white border-indigo-100 shadow-xl shadow-indigo-500/5 space-y-6">
                                                <InputField label="Certification Name" value={newCert.name || undefined} onChange={v => setNewCert({ ...newCert, name: v })} />
                                                <InputField label="Issuing Body" value={newCert.issuing_organization || undefined} onChange={v => setNewCert({ ...newCert, issuing_organization: v })} />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <InputField label="Credential ID" value={newCert.credential_id || undefined} onChange={v => setNewCert({ ...newCert, credential_id: v })} />
                                                    <InputField label="Verification URL" value={newCert.credential_url || undefined} onChange={v => setNewCert({ ...newCert, credential_url: v })} />
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={handleAddCert} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20">Authorize Add</button>
                                                    <button onClick={() => setShowCertForm(false)} className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancel</button>
                                                </div>
                                            </CleanCard>
                                        </motion.div>
                                    )}

                                    <div className="space-y-4">
                                        {user?.certifications?.map(cert => (
                                            <CleanCard key={cert.id} padding="p-8" className="flex items-center justify-between bg-white border-slate-100 hover:border-indigo-200 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                        <GraduationCap className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-lg">{cert.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cert.issuing_organization}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    {cert.credential_url && (
                                                        <a href={cert.credential_url} target="_blank" className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl text-indigo-600 transition-all hover:-translate-y-1">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteCert(cert.id)}
                                                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </CleanCard>
                                        ))}
                                        {(!user?.certifications || user.certifications.length === 0) && (
                                            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 opacity-60">
                                                <Award className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-400" />
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Validations Detected</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </motion.div>
                        )}

                        {activeTab === 'neural' && (
                            <motion.div
                                key="neural"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                <CleanCard padding="p-8 md:p-10" className="bg-white border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                                            <Cpu className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">Skillset Index</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neural competency mapping</p>
                                        </div>
                                    </div>

                                    <div className="mb-10">
                                        <div className="flex flex-wrap gap-3 mb-8">
                                            {formData.skills.map((skill, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="px-5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-tight flex items-center gap-3 group hover:border-blue-200 hover:bg-blue-50 transition-all"
                                                >
                                                    {skill}
                                                    <button onClick={() => removeSkill(skill)} className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </motion.span>
                                            ))}
                                            {formData.skills.length === 0 && (
                                                <p className="text-sm italic text-slate-400 font-medium">Initialize skill parameters below...</p>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <input
                                                placeholder="ADD NEURAL COMPETENCY (TYPE & PRESS ENTER)"
                                                value={newSkill}
                                                onChange={e => setNewSkill(e.target.value)}
                                                onKeyDown={handleAddSkill}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-[10px] font-bold uppercase tracking-widest text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                            />
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full py-5 rounded-2xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'SYNCHRONIZING...' : 'SYNCHRONIZE NEURAL CORE'}
                                    </button>
                                </CleanCard>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <InsightCard title="Growth Rate" val="84%" sub="Active Progression" color="blue" />
                                    <InsightCard title="Synapse Count" val={formData.skills.length} sub="Skills Indexed" color="indigo" />
                                    <InsightCard title="Integrity" val={calculateProfileStrength() + '%'} sub="Profile Health" color="slate" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Edit Modal / Form Overlay */}
                <AnimatePresence>
                    {isEditing && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                className="w-full max-w-md"
                            >
                                <CleanCard padding="p-6 md:p-8" className="bg-white border-slate-200 shadow-2xl relative">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Identity</h3>

                                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Username</label>
                                            <input
                                                value={formData.name || ''}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Professional Bio</label>
                                            <textarea
                                                value={formData.bio || ''}
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                rows={3}
                                                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm resizable-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Location</label>
                                            <input
                                                value={formData.location || ''}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">LinkedIn URL</label>
                                                <input
                                                    value={formData.linkedin || ''}
                                                    onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">GitHub URL</label>
                                                <input
                                                    value={formData.github || ''}
                                                    onChange={e => setFormData({ ...formData, github: e.target.value })}
                                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Personal Website</label>
                                            <input
                                                value={formData.website || ''}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                                        >
                                            {isSaving ? 'Syncing...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </CleanCard>
                            </motion.div>
                        </div>
                    )}
                    {/* Custom Confirmation Modal */}
                    <AnimatePresence>
                        {deleteConfirm && (
                            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 10 }}
                                    className="w-full max-w-sm"
                                >
                                    <CleanCard padding="p-8" className="bg-white border-slate-200 shadow-2xl text-center">
                                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-100">
                                            <Trash2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Confirm Deletion</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                                            Are you sure you want to permanently remove this {deleteConfirm.type}? This operation cannot be reversed.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    if (deleteConfirm.type === 'project') executeDeleteProject(deleteConfirm.id);
                                                    else executeDeleteCert(deleteConfirm.id);
                                                    setDeleteConfirm(null);
                                                }}
                                                className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                                            >
                                                Execute Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-6 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
                                            >
                                                Abort
                                            </button>
                                        </div>
                                    </CleanCard>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </AnimatePresence>
            </main>
        </ProtectedRoute>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shrink-0 outline-none",
                active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function SocialLink({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) {
    const formatUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const url = value ? formatUrl(value) : null;

    return (
        <a
            href={url || '#'}
            target={url ? "_blank" : undefined}
            rel="noopener noreferrer"
            onClick={(e) => !url && e.preventDefault()}
            className={cn(
                "flex items-center justify-between group p-1 transition-all rounded-xl",
                url ? "cursor-pointer hover:bg-slate-50/50" : "cursor-default opacity-60"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center transition-all",
                    url
                        ? "bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600"
                        : "bg-slate-50 border-slate-100 text-slate-300"
                )}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                    <div className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{value ?? 'NOT CONNECTED'}</div>
                </div>
            </div>
            {url && <ExternalLink className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />}
        </a>
    );
}

function StatBox({ icon, val, label, border }: { icon: React.ReactNode, val: number, label: string, border: string }) {
    const borderColor = {
        emerald: 'border-emerald-100 hover:border-emerald-200',
        blue: 'border-blue-100 hover:border-blue-200',
        indigo: 'border-indigo-100 hover:border-indigo-200',
        purple: 'border-purple-100 hover:border-purple-200'
    }[border] || 'border-slate-100';

    const bgColor = {
        emerald: 'bg-emerald-50/30',
        blue: 'bg-blue-50/30',
        indigo: 'bg-indigo-50/30',
        purple: 'bg-purple-50/30'
    }[border] || 'bg-slate-50/30';

    return (
        <CleanCard padding="none" className={cn("transition-all hover:shadow-lg hover:shadow-slate-200/50", borderColor, bgColor)}>
            <div className="p-8">
                <div className="mb-6">{icon}</div>
                <div className="text-4xl font-extrabold text-slate-900 mb-1">{val}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
            </div>
        </CleanCard>
    );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value?: string, onChange: (v: string) => void, placeholder?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{label}</label>
            <input
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
        </div>
    );
}

function InsightCard({ title, val, sub, color }: { title: string, val: string | number, sub: string, color: string }) {
    const colorClass = {
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-200',
        blue: 'text-blue-600 bg-blue-50 border-blue-100 hover:border-blue-200',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-200',
        slate: 'text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300',
        purple: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-200'
    }[color] || 'text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300';

    return (
        <CleanCard className={cn("p-8 transition-all hover:shadow-md", colorClass)}>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">{title}</div>
            <div className="text-3xl font-extrabold mb-1">{val}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">{sub}</div>
        </CleanCard>
    );
}
