/**
 * String Utility Functions
 */

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
            index === 0 ? letter.toLowerCase() : letter.toUpperCase()
        )
        .replace(/[\s\-_]+/g, '');
}

/**
 * Convert string to PascalCase
 */
export function pascalCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
        .replace(/[\s\-_]+/g, '');
}

/**
 * Convert string to snake_case
 */
export function snakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .toLowerCase();
}

/**
 * Convert string to kebab-case
 */
export function kebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Pad string to specified length
 */
export function pad(
    str: string,
    length: number,
    char: string = ' ',
    position: 'left' | 'right' | 'both' = 'right'
): string {
    const padLength = length - str.length;
    if (padLength <= 0) return str;

    const padding = char.repeat(Math.ceil(padLength / char.length));

    switch (position) {
        case 'left':
            return padding.slice(0, padLength) + str;
        case 'right':
            return str + padding.slice(0, padLength);
        case 'both':
            const leftPad = Math.floor(padLength / 2);
            const rightPad = padLength - leftPad;
            return padding.slice(0, leftPad) + str + padding.slice(0, rightPad);
    }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Simple template string replacement
 */
export function template(str: string, data: Record<string, unknown>): string {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
}

/**
 * Count words in a string
 */
export function wordCount(str: string): number {
    const trimmed = str.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
}
