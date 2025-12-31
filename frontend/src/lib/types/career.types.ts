/**
 * Career path information
 */
export interface CareerPath {
    id: string;
    title: string;
    description: string;
    category: string;
    level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    salary_range: {
        min: number;
        max: number;
        currency: string;
    };
    growth_rate: number;
    demand_score: number;
    required_skills: string[];
    optional_skills: string[];
    certifications: string[];
    education_level: string;
    years_experience: number;
    remote_friendly: boolean;
    industry: string[];
}

/**
 * Job match result
 */
export interface JobMatch {
    id: string;
    job_title: string;
    company?: string;
    match_score: number;
    salary_estimate?: {
        min: number;
        max: number;
        currency: string;
    };
    location?: string;
    remote: boolean;
    matched_skills: string[];
    missing_skills: string[];
    description?: string;
    posted_date?: string;
    url?: string;
}

/**
 * Skill matrix/assessment
 */
export interface SkillMatrix {
    technical_skills: SkillCategory[];
    soft_skills: SkillCategory[];
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

/**
 * Skill category
 */
export interface SkillCategory {
    name: string;
    skills: Skill[];
    average_score: number;
}

/**
 * Individual skill
 */
export interface Skill {
    name: string;
    level: number;
    max_level: number;
    status: 'master' | 'elite' | 'proficient' | 'intermediate' | 'beginner' | 'base';
    last_assessed?: string;
    improvement_rate?: number;
}

/**
 * Career roadmap node
 */
export interface RoadmapNode {
    id: string;
    title: string;
    description: string;
    type: 'milestone' | 'skill' | 'certification' | 'project' | 'experience';
    status: 'completed' | 'in_progress' | 'locked' | 'available';
    duration_weeks: number;
    prerequisites: string[];
    resources: Resource[];
    order: number;
}

/**
 * Learning resource
 */
export interface Resource {
    id: string;
    title: string;
    type: 'course' | 'book' | 'article' | 'video' | 'tutorial' | 'documentation';
    url?: string;
    provider?: string;
    duration?: string;
    cost?: number;
    rating?: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Career trajectory prediction
 */
export interface CareerTrajectory {
    current_position: string;
    target_position: string;
    estimated_timeline_months: number;
    confidence_score: number;
    recommended_path: RoadmapNode[];
    alternative_paths: RoadmapNode[][];
    market_trends: MarketTrend[];
}

/**
 * Market trend data
 */
export interface MarketTrend {
    skill: string;
    demand_change: number;
    salary_trend: number;
    job_openings: number;
    growth_projection: number;
    time_period: string;
}
