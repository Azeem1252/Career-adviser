import { create } from 'zustand';
import { careerService } from '../lib/services';
import type { CareerPath, JobMatch, SkillMatrix } from '../lib/types';

interface CareerState {
    careers: CareerPath[];
    selectedCareer: CareerPath | null;
    jobMatches: JobMatch[];
    skillMatrix: SkillMatrix | null;
    loading: boolean;
    error: string | null;

    // Actions
    fetchCareers: (filters?: any) => Promise<void>;
    selectCareer: (id: string) => Promise<void>;
    fetchJobMatches: (filters?: any) => Promise<void>;
    fetchSkillMatrix: () => Promise<void>;
    searchCareers: (query: string) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

export const useCareerStore = create<CareerState>((set, get) => ({
    careers: [],
    selectedCareer: null,
    jobMatches: [],
    skillMatrix: null,
    loading: false,
    error: null,

    fetchCareers: async (filters?: any) => {
        set({ loading: true, error: null });
        try {
            const careers = await careerService.getCareerPaths(filters);
            set({ careers, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch careers',
                loading: false,
            });
        }
    },

    selectCareer: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const selectedCareer = await careerService.getCareerById(id);
            set({ selectedCareer, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch career details',
                loading: false,
            });
        }
    },

    fetchJobMatches: async (filters?: any) => {
        set({ loading: true, error: null });
        try {
            const jobMatches = await careerService.getJobMatches(filters);
            set({ jobMatches, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch job matches',
                loading: false,
            });
        }
    },

    fetchSkillMatrix: async () => {
        set({ loading: true, error: null });
        try {
            const skillMatrix = await careerService.getSkillMatrix();
            set({ skillMatrix, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch skill matrix',
                loading: false,
            });
        }
    },

    searchCareers: async (query: string) => {
        set({ loading: true, error: null });
        try {
            const careers = await careerService.searchCareers(query);
            set({ careers, loading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Search failed',
                loading: false,
            });
        }
    },

    clearError: () => set({ error: null }),

    reset: () =>
        set({
            careers: [],
            selectedCareer: null,
            jobMatches: [],
            skillMatrix: null,
            error: null,
        }),
}));
