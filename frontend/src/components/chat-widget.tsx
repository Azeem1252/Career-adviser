'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, Bot } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedPrompts = [
    'How can I transition to AI engineering?',
    'What skills should I learn next?',
    'Review my career progress',
    'Suggest jobs for me',
];

const mockResponses: Record<string, string> = {
    default: "I'm your AI career advisor! I can help you with career planning, skill development, job recommendations, and interview preparation. What would you like to know?",
    skills: "Based on your profile, I recommend focusing on: 1) Advanced PyTorch for deep learning, 2) Kubernetes for cloud deployment, 3) System design patterns. These align perfectly with your target role as Senior AI Engineer.",
    jobs: "I found 6 high-match opportunities for you! The top match is 'Senior AI Engineer at OpenAI' with 94% compatibility. Would you like me to analyze why this role fits your profile?",
    progress: "Great progress! You've completed 12 assessments and mastered 8 core skills. Your career trajectory shows +32% growth. Keep focusing on Kubernetes and LangChain to reach your target faster.",
};

export const ChatWidget = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your AI career advisor. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const getResponse = (userMessage: string): string => {
        const lower = userMessage.toLowerCase();
        if (lower.includes('skill')) return mockResponses.skills;
        if (lower.includes('job')) return mockResponses.jobs;
        if (lower.includes('progress')) return mockResponses.progress;
        return mockResponses.default;
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response delay
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getResponse(input),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    // Hide on auth pages
    if (pathname?.startsWith('/auth')) return null;

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center z-[150] hover:scale-110 transition-transform group"
                        aria-label="Open AI chat"
                    >
                        <MessageCircle className="w-7 h-7 text-white" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-8 right-8 w-[95vw] md:w-[500px] h-[90vh] max-h-[900px] bg-white rounded-[2.5rem] border-blue-600/20 shadow-[0_0_80px_rgba(0,0,0,0.7)] z-[999] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-black">AI Career Advisor</h3>
                                    <p className="text-xs text-blue-600 font-bold">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors z-10"
                                aria-label="Close chat"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${message.role === 'user'
                                        ? 'bg-blue-600'
                                        : 'bg-muted'
                                        }`}>
                                        {message.role === 'user' ? (
                                            <User className="w-4 h-4 text-white" />
                                        ) : (
                                            <Bot className="w-4 h-4 text-foreground" />
                                        )}
                                    </div>
                                    <div className={`max-w-[70%] p-4 rounded-2xl ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-muted/50'
                                        }`}>
                                        <p className="text-sm font-medium">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-2xl">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Prompts */}
                        {messages.length === 1 && (
                            <div className="px-6 pb-4">
                                <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">
                                    Suggested
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedPrompts.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePromptClick(prompt)}
                                            className="px-3 py-2 rounded-lg bg-muted/30 hover:bg-blue-500/10 text-xs font-bold transition-colors"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-6 border-t border-border">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask me anything..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-muted/20 border-2 border-transparent focus:border-blue-500 focus:outline-none font-medium"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim()}
                                    className="px-4 py-3 rounded-xl bg-blue-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                    aria-label="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full mt-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity"
                            >
                                [ Terminate Session ]
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
