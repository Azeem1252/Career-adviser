/**
 * Central export for all utility functions
 */

export * from './error-handler';
export * from './validators';
export * from './formatters';
export * from './storage';

// Class name utility for merging Tailwind classes
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
