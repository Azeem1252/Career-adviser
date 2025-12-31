import React from 'react';
import { clsx } from 'clsx';

export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className,
}) => {
    const sizeStyles = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={clsx(
                'border-blue-500 border-t-transparent rounded-full animate-spin',
                sizeStyles[size],
                className
            )}
            role="status"
            aria-label="Loading"
        />
    );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner size="lg" />
        {message && (
            <p className="mt-6 text-lg font-bold uppercase tracking-widest text-blue-500">
                {message}
            </p>
        )}
    </div>
);

export const LoadingPage: React.FC<{ message?: string }> = ({
    message = 'Loading...',
}) => (
    <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-6 text-lg font-bold uppercase tracking-widest text-blue-500">
            {message}
        </p>
    </div>
);
