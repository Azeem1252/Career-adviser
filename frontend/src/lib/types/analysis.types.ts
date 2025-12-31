/**
 * Resume analysis result
 */
export interface ResumeAnalysis {
    id: string;
    user_id: number;
    filename: string;
    uploaded_at: string;
    ats_score: ATSScore;
    skill_gaps: SkillGap[];
    suggestions: ImprovementSuggestion[];
    extracted_data: ExtractedResumeData;
    overall_rating: number;
    analysis_version: string;
}

/**
 * ATS (Applicant Tracking System) Score
 */
export interface ATSScore {
    overall_score: number;
    formatting_score: number;
    keyword_score: number;
    structure_score: number;
    readability_score: number;
    issues: ATSIssue[];
    strengths: string[];
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
}

/**
 * ATS Issue
 */
export interface ATSIssue {
    category: 'formatting' | 'keywords' | 'structure' | 'content';
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    location?: string;
    suggestion?: string;
}

/**
 * Skill gap identification
 */
export interface SkillGap {
    skill_name: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    current_level: number;
    required_level: number;
    gap_size: number;
    learning_resources: string[];
    estimated_time_to_acquire: string;
    market_demand: number;
}

/**
 * Improvement suggestion
 */
export interface ImprovementSuggestion {
    id: string;
    category: 'content' | 'formatting' | 'keywords' | 'structure' | 'experience' | 'skills';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact_score: number;
    effort_level: 'easy' | 'moderate' | 'difficult';
    before_example?: string;
    after_example?: string;
    implemented: boolean;
}

/**
 * Extracted resume data
 */
export interface ExtractedResumeData {
    personal_info: {
        name?: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    };
    summary?: string;
    experience: WorkExperience[];
    education: Education[];
    skills: {
        technical: string[];
        soft: string[];
        tools: string[];
        languages: string[];
    };
    certifications: Certification[];
    projects: Project[];
}

/**
 * Work experience entry
 */
export interface WorkExperience {
    company: string;
    position: string;
    location?: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    description: string[];
    achievements: string[];
    technologies?: string[];
}

/**
 * Education entry
 */
export interface Education {
    institution: string;
    degree: string;
    field_of_study: string;
    start_date?: string;
    end_date?: string;
    gpa?: number;
    honors?: string[];
    relevant_coursework?: string[];
}

/**
 * Certification
 */
export interface Certification {
    name: string;
    issuer: string;
    issue_date?: string;
    expiry_date?: string;
    credential_id?: string;
    url?: string;
}

/**
 * Project
 */
export interface Project {
    name: string;
    description: string;
    role?: string;
    technologies: string[];
    start_date?: string;
    end_date?: string;
    url?: string;
    highlights: string[];
}

/**
 * Job match analysis (resume vs job description)
 */
export interface JobMatchAnalysis {
    match_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    matched_skills: string[];
    missing_skills: string[];
    experience_match: {
        required_years: number;
        candidate_years: number;
        meets_requirement: boolean;
    };
    education_match: {
        required: string;
        candidate: string;
        meets_requirement: boolean;
    };
    recommendations: string[];
    resume_adjustments: ResumeAdjustment[];
}

/**
 * Resume adjustment suggestion
 */
export interface ResumeAdjustment {
    section: string;
    current_content?: string;
    suggested_content: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
}
