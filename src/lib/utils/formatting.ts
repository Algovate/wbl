/**
 * String formatting utilities
 */

import { LIMITS } from '../constants.js';

/**
 * Format file size in human-readable format
 */
export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number = LIMITS.VALUE_PREVIEW): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

/**
 * Get a preview of any value
 */
export function getValuePreview(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    switch (typeof value) {
        case 'function':
            return (value as { name?: string }).name || '(anonymous function)';
        case 'object': {
            if (Array.isArray(value)) {
                return `Array(${value.length})`;
            }
            const keys = Object.keys(value as object);
            return `Object{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
        }
        case 'string':
            return truncate(value);
        default:
            return String(value);
    }
}

/**
 * Format source code with basic pretty-printing
 */
export function formatSource(source: string, maxLength: number = LIMITS.SOURCE_PREVIEW): string {
    const formatted = source
        .replace(/;/g, ';\n')
        .replace(/\{/g, '{\n')
        .replace(/\}/g, '\n}');

    if (formatted.length > maxLength) {
        return formatted.substring(0, maxLength) + `\n... (${source.length - maxLength} more chars)`;
    }
    return formatted;
}
