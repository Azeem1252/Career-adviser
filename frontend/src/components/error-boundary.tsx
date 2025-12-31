'use client';

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-background">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full glass-heavy p-12 rounded-[3rem] border-red-500/20 text-center"
                    >
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-red-500/30">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
                            Neural <span className="text-gradient">Disruption.</span>
                        </h1>

                        <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                            An unexpected error occurred in the system architecture. Our neural network is working to restore stability.
                        </p>

                        {this.state.error && (
                            <div className="glass p-6 rounded-2xl border-red-500/10 mb-8 text-left">
                                <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Error Details</div>
                                <code className="text-sm text-red-500 font-mono break-all">
                                    {this.state.error.message}
                                </code>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 mx-auto hover:scale-105 transition-transform shadow-xl shadow-blue-500/20"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Reinitialize System
                        </button>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
