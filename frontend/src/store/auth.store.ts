import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../lib/services';
import type { User, LoginCredentials, RegisterData } from '../lib/types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    _hasHydrated: boolean;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: RegisterData) => Promise<any>;
    logout: () => Promise<void>;
    checkAuth: (force?: boolean) => Promise<void>;
    clearError: () => void;
    setUser: (user: User | null) => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            _hasHydrated: false,

            login: async (credentials: LoginCredentials) => {
                set({ loading: true, error: null });
                try {
                    const response = await authService.login(credentials);
                    authService.setTokens(response.access_token, response.refresh_token);
                    set({
                        user: response.user as User,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.detail || error.response?.data?.message || 'Login failed',
                        loading: false,
                    });
                    throw error;
                }
            },

            register: async (userData: RegisterData) => {
                set({ loading: true, error: null });
                try {
                    const response = await authService.register(userData);

                    if (response.access_token && response.refresh_token) {
                        authService.setTokens(response.access_token, response.refresh_token);
                        set({
                            user: response.user as User,
                            isAuthenticated: true,
                            loading: false,
                        });
                    } else {
                        // User needs to verify email, no tokens provided
                        set({
                            user: null,
                            isAuthenticated: false,
                            loading: false,
                        });
                    }
                    return response;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.detail || error.response?.data?.message || 'Registration failed',
                        loading: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    authService.clearTokens();
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            checkAuth: async (force: boolean = false) => {
                // Wait for hydration to complete
                if (!get()._hasHydrated) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Check if we have a token in localStorage
                const hasToken = authService.isAuthenticated();

                if (!hasToken) {
                    set({ user: null, isAuthenticated: false, loading: false });
                    return;
                }

                // If we have persisted user data and a token, and NOT forcing, restore the session immediately
                if (!force) {
                    const currentState = get();
                    if (currentState.user && currentState.isAuthenticated && hasToken) {
                        set({ loading: false });
                        return;
                    }
                }

                // Otherwise, verify with the backend
                set({ loading: true });
                try {
                    const user = await authService.getCurrentUser();
                    set({
                        user,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    authService.clearTokens();
                    set({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                    });
                }
            },

            clearError: () => set({ error: null }),

            setUser: (user: User | null) => set({ user }),

            setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
