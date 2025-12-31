import api from '../api';

export interface ResumeAnalysisRequest {
    job_description?: string;
}

export interface RoadmapRequest {
    current_profile: string;
    target_career: string;
}

export interface InterviewQuestionsRequest {
    job_title: string;
    description?: string;
    difficulty?: 'entry' | 'intermediate' | 'expert';
    count?: number;
}

export interface InterviewEvaluationRequest {
    question: string;
    answer: string;
    job_title: string;
}

export interface CoverLetterRequest {
    job_title: string;
    company_name?: string;
    job_description?: string;
    tone?: string;
    key_accomplishments?: string;
}

export interface CareerMatchRequest {
    skills: string[];
    interests: string[];
    experience_level?: string;
}

export interface RoadmapStage {
    id: string;
    title: string;
    description: string;
    duration?: string;
    completed: boolean;
    completed_skills?: string[];
    completed_resources?: string[];
    skills_to_master?: string[];  // Legacy field
    skills?: string[];  // Current field from AI
    resources: string[];
    notes?: string;
}

export interface Roadmap {
    id: string;
    title: string;
    target_career: string;
    difficulty?: string;
    duration?: string;
    created_at: string;
    stages: RoadmapStage[];
    progress?: {
        total_stages: number;
        completed_stages: number;
        completion_percentage: number;
    };
}

class AIService {
    /**
     * Analyze resume with optional job description context
     */
    async analyzeResume(file: File, jobDescription?: string): Promise<any> {
        const formData = new FormData();
        formData.append('resume', file);
        if (jobDescription) {
            formData.append('job_description', jobDescription);
        }

        // Delete Content-Type header to let axios set it automatically with boundary
        const response = await api.post('/analyzer/resume', formData, {
            headers: {
                'Content-Type': undefined, // Remove default JSON content-type
            },
        });
        return response.data;
    }

    /**
     * Get resume analysis history
     */
    async getAnalysisHistory(): Promise<any[]> {
        const response = await api.get('/analyzer/history');
        return response.data;
    }

    /**
     * Generate career roadmap
     */
    async generateRoadmap(data: RoadmapRequest): Promise<Roadmap> {
        const response = await api.post('/roadmaps/generate', data);
        return response.data;
    }

    /**
     * Get user roadmaps
     */
    async getRoadmaps(): Promise<any[]> {
        const response = await api.get('/roadmaps/');
        return response.data;
    }

    /**
     * Generate mock interview questions
     */
    async generateInterviewQuestions(data: InterviewQuestionsRequest): Promise<any> {
        const response = await api.post('/interviewer/questions', data);
        return response.data;
    }

    /**
     * Evaluate interview answer
     */
    async evaluateInterviewAnswer(data: InterviewEvaluationRequest): Promise<any> {
        const response = await api.post('/interviewer/evaluate', data);
        return response.data;
    }

    /**
     * Match careers based on skills and interests
     */
    async matchCareers(data: CareerMatchRequest): Promise<any> {
        const response = await api.post('/careers/match', data);
        return response.data;
    }

    /**
     * Generate cover letter
     */
    async generateCoverLetter(data: CoverLetterRequest): Promise<{ content: string }> {
        const response = await api.post<{ content: string }>('/analyzer/cover-letter', data);
        return response.data;
    }

    /**
     * Get AI-driven market trends
     */
    async getMarketTrends(industry?: string): Promise<any> {
        const response = await api.get('/careers/market-trends', {
            params: { industry }
        });
        return response.data;
    }

    /**
     * Toggle stage completion for a roadmap
     */
    async toggleStageCompletion(roadmapId: string | number, stageIndex: string | number): Promise<any> {
        const url = `/roadmaps/${roadmapId}/stages/${stageIndex}/toggle`;
        const response = await api.post(url, {});
        return response.data;
    }

    /**
     * Toggle individual skill completion
     */
    async toggleSkillCompletion(roadmapId: string | number, stageIndex: number, skillName: string): Promise<any> {
        const url = `/roadmaps/${roadmapId}/stages/${stageIndex}/skills/toggle`;
        const response = await api.post(url, { skill_name: skillName });
        return response.data;
    }

    /**
     * Toggle individual resource completion
     */
    async toggleResourceCompletion(roadmapId: string | number, stageIndex: number, resourceName: string): Promise<any> {
        const url = `/roadmaps/${roadmapId}/stages/${stageIndex}/resources/toggle`;
        const response = await api.post(url, { resource_name: resourceName });
        return response.data;
    }

    /**
     * Get progress for a specific roadmap
     */
    async getRoadmapProgress(roadmapId: string | number): Promise<any> {
        const response = await api.get(`/roadmaps/${roadmapId}/progress`);
        return response.data;
    }

    /**
     * Get tactical advice for a specific stage
     */
    async getTacticalAdvice(roadmapId: string | number, stageIndex: number): Promise<any> {
        const url = `/roadmaps/${roadmapId}/stages/${stageIndex}/tactics`;
        const response = await api.post(url, {});
        return response.data;
    }

    /**
     * Update notes for a specific stage
     */
    async updateStageNotes(roadmapId: string | number, stageIndex: string | number, notes: string): Promise<any> {
        const response = await api.put(`/roadmaps/${roadmapId}/stages/${stageIndex}/notes`, {
            notes
        });
        return response.data;
    }

    /**
     * Delete a roadmap
     */
    async deleteRoadmap(roadmapId: string | number): Promise<any> {
        const response = await api.delete(`/roadmaps/${roadmapId}`);
        return response.data;
    }

    /**
     * Start a new career assessment
     */
    async startAssessment(): Promise<{ assessment_id: number, message: string }> {
        const response = await api.post('/assessment/start');
        return response.data;
    }

    /**
     * Submit completed assessment
     */
    async submitAssessment(assessmentId: number, responses: any): Promise<any> {
        const response = await api.put(`/assessment/${assessmentId}/submit`, { responses });
        return response.data;
    }

    /**
     * Complete onboarding and set initial preferences
     */
    async completeOnboarding(preferences: any): Promise<any> {
        const response = await api.post('/users/onboard', preferences);
        return response.data;
    }

    /**
     * Get user's latest assessment
     */
    async getLatestAssessment(): Promise<any> {
        const response = await api.get('/assessment/latest');
        return response.data;
    }
}

export const aiService = new AIService();
