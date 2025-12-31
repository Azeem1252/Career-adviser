import api from '../api';
import type {
    CareerPath,
    JobMatch,
    SkillMatrix,
    RoadmapNode,
    CareerTrajectory,
    MarketTrend,
} from '../types';

/**
 * Career Service
 * Handles career exploration and planning API calls
 */
class CareerService {
    /**
     * Get all available career paths
     */
    async getCareerPaths(filters?: {
        category?: string;
        level?: string;
        industry?: string;
    }): Promise<CareerPath[]> {
        const response = await api.get<CareerPath[]>('/careers', {
            params: filters,
        });
        return response.data;
    }

    /**
     * Get specific career path by ID
     */
    async getCareerById(id: string): Promise<CareerPath> {
        const response = await api.get<CareerPath>(`/careers/${id}`);
        return response.data;
    }

    /**
     * Get job matches based on user profile
     */
    async getJobMatches(filters?: {
        remote?: boolean;
        location?: string;
        min_salary?: number;
    }): Promise<JobMatch[]> {
        const response = await api.get<JobMatch[]>('/careers/matches', {
            params: filters,
        });
        return response.data;
    }

    /**
     * Get user's skill matrix
     */
    async getSkillMatrix(): Promise<SkillMatrix> {
        const response = await api.get<SkillMatrix>('/careers/skills/matrix');
        return response.data;
    }

    /**
     * Get career roadmap
     */
    async getRoadmap(careerId: string): Promise<RoadmapNode[]> {
        const response = await api.get<RoadmapNode[]>(`/careers/${careerId}/roadmap`);
        return response.data;
    }

    /**
     * Search careers by query
     */
    async searchCareers(query: string): Promise<CareerPath[]> {
        const response = await api.get<CareerPath[]>('/careers/search', {
            params: { q: query },
        });
        return response.data;
    }

    /**
     * Get career trajectory prediction
     */
    async getCareerTrajectory(targetCareer: string): Promise<CareerTrajectory> {
        const response = await api.get<CareerTrajectory>('/careers/trajectory', {
            params: { target: targetCareer },
        });
        return response.data;
    }

    /**
     * Get market trends for specific skills
     */
    async getMarketTrends(skills: string[]): Promise<MarketTrend[]> {
        const response = await api.post<MarketTrend[]>('/careers/market-trends', {
            skills,
        });
        return response.data;
    }

    /**
     * Update roadmap node status
     */
    async updateRoadmapNode(
        nodeId: string,
        status: 'completed' | 'in_progress' | 'locked' | 'available'
    ): Promise<RoadmapNode> {
        const response = await api.patch<RoadmapNode>(`/careers/roadmap/${nodeId}`, {
            status,
        });
        return response.data;
    }

    /**
     * Get recommended careers based on skills
     */
    async getRecommendedCareers(skills: string[]): Promise<CareerPath[]> {
        const response = await api.post<CareerPath[]>('/careers/recommendations', {
            skills,
        });
        return response.data;
    }

    /**
     * Compare two career paths
     */
    async compareCareers(careerIds: string[]): Promise<{
        careers: CareerPath[];
        comparison: Record<string, any>;
    }> {
        const response = await api.post('/careers/compare', {
            career_ids: careerIds,
        });
        return response.data;
    }
}

export default new CareerService();
