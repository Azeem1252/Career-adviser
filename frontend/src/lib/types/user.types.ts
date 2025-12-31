export interface UserProject {
    id: number;
    user_id: number;
    title: string;
    description?: string | null;
    link?: string | null;
    technologies?: string | null;
    created_at: string;
}

export interface UserCertification {
    id: number;
    user_id: number;
    name: string;
    issuing_organization: string;
    issue_date?: string | null;
    expiration_date?: string | null;
    credential_id?: string | null;
    credential_url?: string | null;
    created_at: string;
}

/**
 * Core User interface
 */
export interface User {
    id: number;
    email: string;
    name: string;
    is_active: boolean;
    is_verified: boolean;
    bio?: string | null;
    location?: string | null;
    projects?: UserProject[];
    certifications?: UserCertification[];
    created_at: string;
    updated_at?: string | null;
    skills?: string[];
    xp?: number;
    onboarded: boolean;
    career_preferences?: any;
    profile_summary?: string | null;
    avatar_url?: string | null;
    linkedin?: string | null;
    github?: string | null;
    website?: string | null;
}

/**
 * Extended user profile
 */
export interface UserProfile extends User {
    phone?: string;
    avatar?: string;
    current_role?: string;
    company?: string;
    years_of_experience?: number;
}

/**
 * User registration data
 */
export interface RegisterData {
    email: string;
    password: string;
    name: string;
    confirm_password?: string;
}

/**
 * User login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
    email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirm {
    token: string;
    new_password: string;
    confirm_password?: string;
}
