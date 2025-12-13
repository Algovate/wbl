/**
 * Simple API module for source map demo
 */

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/**
 * Fetch user data from API
 */
export async function fetchUser(userId: number): Promise<ApiResponse<User>> {
    // Simulated API call
    const user: User = {
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`
    };

    return {
        success: true,
        data: user
    };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Format user display name
 */
export function formatUserName(user: User): string {
    return `${user.name} <${user.email}>`;
}
