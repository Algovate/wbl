/**
 * Object Utility Functions
 */

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
    const result = {} as T;

    for (const obj of objects) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const existing = result[key as keyof T];

                if (value && typeof value === 'object' && !Array.isArray(value) &&
                    existing && typeof existing === 'object' && !Array.isArray(existing)) {
                    result[key as keyof T] = deepMerge(existing, value) as T[keyof T];
                } else {
                    result[key as keyof T] = value as T[keyof T];
                }
            }
        }
    }

    return result;
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result as Omit<T, K>;
}

/**
 * Check if an object is empty
 */
export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * Get nested value from object using dot notation
 */
export function get<T = unknown>(obj: object, path: string, defaultValue?: T): T | undefined {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = (result as Record<string, unknown>)[key];
    }

    return (result === undefined ? defaultValue : result) as T;
}

/**
 * Set nested value in object using dot notation
 */
export function set<T extends object>(obj: T, path: string, value: unknown): T {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: Record<string, unknown> = obj as Record<string, unknown>;

    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
    return obj;
}
