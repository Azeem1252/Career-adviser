'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Sparkles, Send, Copy,
    Download, RefreshCw, PenTool, BrainCircuit,
    Zap, ShieldCheck, ArrowRight, FileDown,
    Target, Cpu, Terminal, Layout, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/store/use-toast';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { CleanCard } from '@/components/ui/CleanCard';
import { cn } from '@/lib/utils';

import { userService, aiService } from '@/lib/services';

export default function CoverLetterPage() {
    const { user } = useAuthStore();
    const { success, error: toastError, info } = useToast();
    const [generating, setGenerating] = useState(false);
    const [content, setContent] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [accomplishments, setAccomplishments] = useState("");
    const [tone, setTone] = useState("Professional");
    const [latestAssessment, setLatestAssessment] = useState<any>(null);

    React.useEffect(() => {
        const loadAssessment = async () => {
            try {
                const data = await aiService.getLatestAssessment();
                setLatestAssessment(data);
                // Pre-fill accomplishments from strengths if empty
                if (data?.strengths && !accomplishments) {
                    setAccomplishments(data.strengths.join(", "));
                }
            } catch (err) {
                console.error("Failed to load assessment for cover letter:", err);
            }
        };
        loadAssessment();
    }, []);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobTitle) return toastError("Specify the job title to begin.");

        setGenerating(true);
        info("Synthesizing your professional narrative...");

        try {
            const result = await aiService.generateCoverLetter({
                job_title: jobTitle,
                company_name: companyName,
                job_description: jobDescription,
                key_accomplishments: accomplishments,
                tone: tone
            });
            setContent(result.content);
            success("Cover letter generated successfully.");
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.detail || "Failed to generate cover letter.";
            toastError(message);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content);
        success("Copied to clipboard.");
    };

    const downloadAsTxt = () => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const fileName = `Cover_Letter_${jobTitle.replace(/\s+/g, '_')}.txt`;
        saveAs(blob, fileName);
        success("Exported as .txt");
    };

    const downloadAsDocx = async () => {
        try {
            // Split content by both single and double line breaks to preserve structure
            const lines = content.split('\n');
            const docChildren: any[] = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line) {
                    // Create paragraph with text
                    docChildren.push(
                        new Paragraph({
                            children: [new TextRun(line)],
                            spacing: {
                                after: 120,  // Space after each line
                                before: 0
                            }
                        })
                    );
                } else {
                    // Empty line - add extra spacing
                    docChildren.push(
                        new Paragraph({
                            children: [new TextRun('')],
                            spacing: {
                                after: 240  // Double space for empty lines
                            }
                        })
                    );
                }
            }

            const doc = new Document({
                sections: [{
                    children: docChildren
                }]
            });

            const blob = await Packer.toBlob(doc);
            const fileName = `Cover_Letter_${jobTitle.replace(/\s+/g, '_')}.docx`;
            saveAs(blob, fileName);
            success("Exported as .docx");
        } catch (err) {
            console.error(err);
            toastError("DOCX export failed.");
        }
    };

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#f8fafc] pt-24 md:pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                            <PenTool className="w-3.5 h-3.5" />
                            <span>System Protocol: Narrative Synthesis 2.0</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none mb-6">
                            Cover <span className="text-primary italic">Letter.</span>
                        </h1>
                        <p className="max-w-2xl text-slate-500 text-lg font-medium leading-relaxed">
                            Engineer your professional impact. Our AI engine builds high-fidelity cover letters tailored for tactical market entry.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Control Panel */}
                        <div className="lg:col-span-5">
                            <CleanCard padding="none" className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 sticky top-32 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Target className="text-blue-600 w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Target Parameters</h3>
                                </div>

                                <form onSubmit={handleGenerate} className="p-8 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Job Title</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g. Senior Product Designer"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        />

                                        {latestAssessment?.recommended_roles && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {latestAssessment.recommended_roles.slice(0, 3).map((role: any) => (
                                                    <button
                                                        key={role.title}
                                                        type="button"
                                                        onClick={() => setJobTitle(role.title)}
                                                        className={cn(
                                                            "px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                                                            jobTitle === role.title
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
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Company</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="e.g. Anthropic"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Job Description</label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the job requirements here..."
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all h-28 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Key Accomplishments</label>
                                        <textarea
                                            value={accomplishments}
                                            onChange={(e) => setAccomplishments(e.target.value)}
                                            placeholder="What makes you the best fit for this role?"
                                            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all h-28 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Letter Tone</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Confident', 'Professional', 'Strategic'].map(t => (
                                                <button
                                                    type="button"
                                                    key={t}
                                                    onClick={() => setTone(t)}
                                                    className={cn(
                                                        "py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                                                        tone === t
                                                            ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={generating}
                                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                    >
                                        {generating ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Generate Letter
                                                <Zap className="w-5 h-5 fill-white" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </CleanCard>
                        </div>

                        {/* Terminal / Output View */}
                        <div className="lg:col-span-7">
                            <CleanCard padding="none" className="h-full min-h-[800px] flex flex-col bg-white border-slate-200 shadow-2xl relative overflow-hidden">
                                <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", content ? "bg-blue-500 animate-pulse" : "bg-slate-200")} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {generating ? 'Writing in progress...' : content ? 'Ready for Export' : 'Awaiting Synthesis'}
                                        </span>
                                    </div>
                                    {content && (
                                        <div className="flex gap-2">
                                            <ActionIcon onClick={copyToClipboard} icon={<Copy className="w-4 h-4" />} title="Copy" />
                                            <ActionIcon onClick={downloadAsTxt} icon={<FileText className="w-4 h-4" />} title="TXT" />
                                            <ActionIcon onClick={downloadAsDocx} icon={<FileDown className="w-4 h-4" />} title="DOCX" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col p-8 md:p-12">
                                    <AnimatePresence mode="wait">
                                        {generating ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center gap-6"
                                            >
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                                                </div>
                                                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Neural Narrative Engine Active</div>
                                            </motion.div>
                                        ) : content ? (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex-1 font-serif text-slate-700 text-lg leading-relaxed whitespace-pre-wrap selection:bg-blue-100"
                                            >
                                                {content}
                                            </motion.div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-6 grayscale">
                                                <FileText className="w-24 h-24 text-slate-900" />
                                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Initialize Parameters to Begin</div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="p-6 bg-blue-50/50 border-t border-blue-100 flex items-center gap-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-800/60 leading-relaxed uppercase tracking-widest">
                                        ATS Optimized Narrative • Strategic Industry Alignment • Professional Impact Guaranteed
                                    </p>
                                </div>
                            </CleanCard>
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}

function ActionIcon({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
    return (
        <button
            onClick={onClick}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 transition-all hover:-translate-y-0.5"
            title={title}
        >
            {icon}
        </button>
    );
}
