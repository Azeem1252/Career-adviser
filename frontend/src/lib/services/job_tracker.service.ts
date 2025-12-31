import api from '../api';
import type {
    JobApplication,
    JobApplicationCreate,
    JobApplicationUpdate
} from '../types';

/**
 * Job Tracker Service
 * Handles application lifecycle tracking
 */
class JobTrackerService {
    /**
     * Get all job applications for the current user
     */
    async getApplications(): Promise<JobApplication[]> {
        const response = await api.get<JobApplication[]>('/jobs-tracker/');
        return response.data;
    }

    /**
     * Get a single job application
     */
    async getApplication(id: number): Promise<JobApplication> {
        const response = await api.get<JobApplication>(`/jobs-tracker/${id}`);
        return response.data;
    }

    /**
     * Create a new job application entry
     */
    async createApplication(data: JobApplicationCreate): Promise<JobApplication> {
        const response = await api.post<JobApplication>('/jobs-tracker/', data);
        return response.data;
    }

    /**
     * Update an existing job application
     */
    async updateApplication(id: number, data: JobApplicationUpdate): Promise<JobApplication> {
        const response = await api.put<JobApplication>(`/jobs-tracker/${id}`, data);
        return response.data;
    }

    /**
     * Remove a job application
     */
    async deleteApplication(id: number): Promise<void> {
        await api.delete(`/jobs-tracker/${id}`);
    }
}

export const jobTrackerService = new JobTrackerService();
