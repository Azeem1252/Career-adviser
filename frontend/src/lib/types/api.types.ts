/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

/**
 * API Error structure
 */
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
    timestamp?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Request configuration options
 */
export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    withCredentials?: boolean;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
}

import { User } from './user.types';

/**
 * Authentication response
 */
export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}
