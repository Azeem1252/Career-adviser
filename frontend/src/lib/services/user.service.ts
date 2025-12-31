import api from '../api';
import type {
    UserProfile,
    UserProject,
    UserCertification,
} from '../types';

/**
 * User Service
 * Handles user profile and professional achievements API calls
 */
class UserService {
    /**
     * Get user profile
     */
    async getUserProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>('/users/profile');
        return response.data;
    }

    /**
     * Update user profile
     */
    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.put<UserProfile>('/users/profile', data);
        return response.data;
    }

    /**
     * Add a project
     */
    async addProject(project: Partial<UserProject>): Promise<UserProject> {
        const response = await api.post<UserProject>('/users/projects', project);
        return response.data;
    }

    /**
     * Delete a project
     */
    async deleteProject(projectId: number): Promise<void> {
        await api.delete(`/users/projects/${projectId}`);
    }

    /**
     * Add a certification
     */
    async addCertification(certification: Partial<UserCertification>): Promise<UserCertification> {
        const response = await api.post<UserCertification>('/users/certifications', certification);
        return response.data;
    }

    /**
     * Delete a certification
     */
    async deleteCertification(certId: number): Promise<void> {
        await api.delete(`/users/certifications/${certId}`);
    }

    /**
     * Upload user avatar
     */
    async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{ avatar_url: string }>(
            '/users/avatar',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }

    /**
     * Delete user account
     */
    async deleteAccount(): Promise<void> {
        await api.delete('/users/account');
    }

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<{
        total_analyses: number;
        total_roadmaps: number;
        total_projects: number;
        total_certifications: number;
        total_activity: number;
    }> {
        const response = await api.get('/users/stats');
        return response.data;
    }

    /**
     * Change password for authenticated user
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.post('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
        return response.data;
    }

    /**
     * Get notification preferences
     */
    async getNotificationPreferences(): Promise<{ email: boolean; push: boolean; weekly: boolean }> {
        const response = await api.get('/users/notifications');
        return response.data;
    }

    /**
     * Update notification preferences
     */
    async updateNotificationPreferences(prefs: { email?: boolean; push?: boolean; weekly?: boolean }): Promise<{ email: boolean; push: boolean; weekly: boolean }> {
        const response = await api.put('/users/notifications', prefs);
        return response.data;
    }

    /**
     * Export all user data as CSV
     */
    async exportUserData(): Promise<Blob> {
        const response = await api.get('/users/export', {
            responseType: 'blob'
        });
        return response.data;
    }
}

export default new UserService();

