import api from '../api';
import type {
    AuthResponse,
    LoginCredentials,
    RegisterData,
    User,
    ForgotPasswordRequest,
    PasswordResetConfirm,
} from '../types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    }

    /**
     * Register new user
     */
    async register(userData: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', userData);
        return response.data;
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        await api.post('/auth/logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data;
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    }

    /**
     * Verify email with token
     */
    async verifyEmail(token: string): Promise<void> {
        await api.post('/auth/verify-email', { token });
    }

    /**
     * Request password reset email
     */
    async requestPasswordReset(data: ForgotPasswordRequest): Promise<void> {
        await api.post('/auth/forgot-password', data);
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: PasswordResetConfirm): Promise<void> {
        await api.post('/auth/reset-password', data);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    /**
     * Get stored access token
     */
    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    /**
     * Get stored refresh token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Store authentication tokens
     */
    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    /**
     * Clear authentication tokens
     */
    clearTokens(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}

export default new AuthService();
