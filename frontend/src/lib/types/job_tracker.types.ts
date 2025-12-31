/**
 * Job Tracker Types
 */

export type JobStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface JobApplication {
    id: number;
    user_id: number;
    company_name: string;
    job_title: string;
    status: JobStatus;
    applied_at?: string;
    job_url?: string;
    notes?: string;
    salary_expectation?: string;
    location?: string;
    created_at: string;
    updated_at?: string;
}

export interface JobApplicationCreate {
    company_name: string;
    job_title: string;
    status: JobStatus;
    job_url?: string;
    notes?: string;
    salary_expectation?: string;
    location?: string;
    applied_at?: string;
}

export interface JobApplicationUpdate {
    company_name?: string;
    job_title?: string;
    status?: JobStatus;
    job_url?: string;
    notes?: string;
    salary_expectation?: string;
    location?: string;
    applied_at?: string;
}
