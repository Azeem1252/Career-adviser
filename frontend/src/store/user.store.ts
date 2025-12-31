import { create } from 'zustand';
import { userService } from '../lib/services';
import type { UserProfile } from '../lib/types';

interface UserState {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    loading: false,
    error: null,

    fetchProfile: async () => {
        set({ loading: true, error: null });
        try {
            const profile = await userService.getUserProfile();
            set({ profile, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch profile',
                loading: false,
            });
        }
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        set({ loading: true, error: null });
        try {
            const profile = await userService.updateProfile(data);
            set({ profile, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update profile',
                loading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),

    reset: () =>
        set({
            profile: null,
            error: null,
            loading: false
        }),
}));
