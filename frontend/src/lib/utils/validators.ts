/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Password validation with detailed error messages
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Phone number validation (basic international format)
 */
export function validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    return phoneRegex.test(phone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

/**
 * URL validation
 */
export function validateURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(
        (field) => !data[field] || (typeof data[field] === 'string' && !data[field].trim())
    );

    return {
        valid: missingFields.length === 0,
        missingFields: missingFields as string[],
    };
}

/**
 * Validate LinkedIn URL
 */
export function validateLinkedInURL(url: string): boolean {
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w-]+\/?$/;
    return linkedInRegex.test(url);
}

/**
 * Validate GitHub URL
 */
export function validateGitHubURL(url: string): boolean {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/;
    return githubRegex.test(url);
}
