import type { ApiError } from '../types';
import { AxiosError } from 'axios';

/**
 * Handle API errors and return user-friendly messages
 */
export function handleApiError(error: unknown): string {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError | undefined;

        if (apiError?.message) {
            return apiError.message;
        }

        if (error.response?.status === 401) {
            return 'Authentication required. Please log in.';
        }

        if (error.response?.status === 403) {
            return 'You do not have permission to perform this action.';
        }

        if (error.response?.status === 404) {
            return 'The requested resource was not found.';
        }

        if (error.response?.status === 422) {
            return 'Invalid data provided. Please check your input.';
        }

        if (error.response?.status === 429) {
            return 'Too many requests. Please try again later.';
        }

        if (error.response?.status !== undefined && error.response.status >= 500) {
            return 'Server error. Please try again later.';
        }

        if (error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.';
        }

        if (error.code === 'ECONNABORTED') {
            return 'Request timeout. Please try again.';
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    }
    return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof AxiosError) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    return false;
}

/**
 * Get error message from various error types
 */
export function getErrorMessage(error: unknown): string {
    return handleApiError(error);
}

/**
 * Extract validation errors from API response
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data as ApiError | undefined;
        return apiError?.errors || {};
    }
    return {};
}

/**
 * Check if error has validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
    const errors = getValidationErrors(error);
    return Object.keys(errors).length > 0;
}
