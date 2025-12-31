/**
 * Local storage wrapper with error handling and type safety
 */

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): void {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
}

/**
 * Get item from localStorage
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        return JSON.parse(item) as T;
    } catch (error) {
        console.error(`Error reading from localStorage (key: ${key}):`, error);
        return defaultValue !== undefined ? defaultValue : null;
    }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
}

/**
 * Clear all items from localStorage
 */
export function clearStorage(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

/**
 * Check if key exists in localStorage
 */
export function hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
}

/**
 * Get all keys from localStorage
 */
export function getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            keys.push(key);
        }
    }
    return keys;
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(): number {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value) {
                size += key.length + value.length;
            }
        }
    }
    return size;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
}
