import api from '../api';
import type {
    ResumeAnalysis,
    ATSScore,
    SkillGap,
    ImprovementSuggestion,
    JobMatchAnalysis,
} from '../types';

/**
 * Analysis Service
 * Handles resume analysis and job matching API calls
 */
class AnalysisService {
    /**
     * Analyze resume file
     */
    async analyzeResume(file: File): Promise<ResumeAnalysis> {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await api.post<ResumeAnalysis>('/analysis/resume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    /**
     * Get ATS score for a resume
     */
    async getATSScore(resumeId: string): Promise<ATSScore> {
        const response = await api.get<ATSScore>(`/analysis/resume/${resumeId}/ats-score`);
        return response.data;
    }

    /**
     * Get skill gaps from resume analysis
     */
    async getSkillGaps(resumeId: string): Promise<SkillGap[]> {
        const response = await api.get<SkillGap[]>(`/analysis/resume/${resumeId}/skill-gaps`);
        return response.data;
    }

    /**
     * Get improvement suggestions
     */
    async getSuggestions(resumeId: string): Promise<ImprovementSuggestion[]> {
        const response = await api.get<ImprovementSuggestion[]>(
            `/analysis/resume/${resumeId}/suggestions`
        );
        return response.data;
    }

    /**
     * Compare resume with job description
     */
    async compareWithJob(
        resumeId: string,
        jobDescription: string
    ): Promise<JobMatchAnalysis> {
        const response = await api.post<JobMatchAnalysis>(
            `/analysis/resume/${resumeId}/match-job`,
            {
                job_description: jobDescription,
            }
        );
        return response.data;
    }

    /**
     * Get all user's resume analyses
     */
    async getUserAnalyses(): Promise<ResumeAnalysis[]> {
        const response = await api.get<ResumeAnalysis[]>('/analysis/resumes');
        return response.data;
    }

    /**
     * Get specific resume analysis
     */
    async getAnalysisById(resumeId: string): Promise<ResumeAnalysis> {
        const response = await api.get<ResumeAnalysis>(`/analysis/resume/${resumeId}`);
        return response.data;
    }

    /**
     * Delete resume analysis
     */
    async deleteAnalysis(resumeId: string): Promise<void> {
        await api.delete(`/analysis/resume/${resumeId}`);
    }

    /**
     * Mark suggestion as implemented
     */
    async markSuggestionImplemented(
        resumeId: string,
        suggestionId: string
    ): Promise<ImprovementSuggestion> {
        const response = await api.patch<ImprovementSuggestion>(
            `/analysis/resume/${resumeId}/suggestions/${suggestionId}`,
            {
                implemented: true,
            }
        );
        return response.data;
    }

    /**
     * Re-analyze existing resume
     */
    async reanalyzeResume(resumeId: string): Promise<ResumeAnalysis> {
        const response = await api.post<ResumeAnalysis>(
            `/analysis/resume/${resumeId}/reanalyze`
        );
        return response.data;
    }

    /**
     * Export analysis report
     */
    async exportAnalysis(
        resumeId: string,
        format: 'pdf' | 'json' | 'csv'
    ): Promise<Blob> {
        const response = await api.get(`/analysis/resume/${resumeId}/export`, {
            params: { format },
            responseType: 'blob',
        });
        return response.data;
    }

    /**
     * Get analysis statistics
     */
    async getAnalysisStats(): Promise<{
        total_analyses: number;
        average_ats_score: number;
        top_skill_gaps: string[];
        improvement_rate: number;
    }> {
        const response = await api.get('/analysis/stats');
        return response.data;
    }
}

export default new AnalysisService();
