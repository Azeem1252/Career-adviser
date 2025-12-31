'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <nav aria-label="Breadcrumb" className="mb-8">
            <motion.ol
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 flex-wrap"
            >
                <li>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-emerald-500 transition-all"
                        aria-label="Home"
                    >
                        <Home className="w-3 h-3" />
                        Home
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 opacity-30" />
                        {item.href && index < items.length - 1 ? (
                            <Link
                                href={item.href}
                                className="text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-emerald-500 transition-all"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </motion.ol>
        </nav>
    );
};
