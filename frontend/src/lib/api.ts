import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 90000, // 90 seconds (increased for AI operations)
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Do not redirect if we are already on a login/register page or if the request itself is for login
            const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
            const isAuthPage = typeof window !== 'undefined' && (window.location.pathname.includes('/auth/login') || window.location.pathname.includes('/auth/register'));

            // Public pages that should never redirect to login
            const publicPaths = ['/', '/careers', '/analyzer'];
            const isPublicPage = typeof window !== 'undefined' && publicPaths.some(path =>
                window.location.pathname === path || window.location.pathname === ''
            );

            if (isAuthRequest || isAuthPage) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token: newRefreshToken } = response.data;
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', newRefreshToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    }

                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');

                    // Only redirect to login from protected pages
                    if (typeof window !== 'undefined' && !isPublicPage) {
                        window.location.href = '/auth/login';
                    }

                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, clear tokens
                localStorage.removeItem('access_token');

                // Only redirect to login from protected pages
                if (typeof window !== 'undefined' && !isPublicPage) {
                    window.location.href = '/auth/login';
                }
            }
        }

        // Handle network errors
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error:', error.message);
        }

        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.message);
        }

        return Promise.reject(error);
    }
);

/**
 * Retry failed requests with exponential backoff
 */
export async function retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error as Error;

            // Don't retry on 4xx errors (client errors)
            if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
                throw error;
            }

            if (i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
}

export default api;

