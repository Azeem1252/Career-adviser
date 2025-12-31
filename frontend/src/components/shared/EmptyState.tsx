import React from 'react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => (
    <div
        className={clsx(
            'flex flex-col items-center justify-center text-center p-12 md:p-20',
            className
        )}
    >
        {icon && (
            <div className="w-20 h-20 rounded-3xl glass border-blue-500/20 flex items-center justify-center mb-6 text-blue-500">
                {icon}
            </div>
        )}
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic mb-3">
            {title}
        </h3>
        {description && (
            <p className="text-muted-foreground max-w-md mb-8">{description}</p>
        )}
        {action && (
            <button
                onClick={action.onClick}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
                {action.label}
            </button>
        )}
    </div>
);
