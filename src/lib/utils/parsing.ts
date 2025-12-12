/**
 * Brace/bracket parsing utilities
 */

/**
 * Find the matching closing brace for an opening brace at the given position.
 * Handles nested braces, brackets, parentheses, strings, and regex literals.
 * 
 * @param content The source code content
 * @param openPos The position of the opening brace '{'
 * @returns The position of the matching closing brace '}', or -1 if not found
 */
export function findMatchingBrace(content: string, openPos: number): number {
    if (openPos < 0 || openPos >= content.length || content[openPos] !== '{') {
        return -1;
    }

    let depth = 0;
    let inString = false;
    let stringChar: string | null = null;
    let inRegex = false;
    let escapeNext = false;

    for (let i = openPos; i < content.length; i++) {
        const char = content[i];
        const prevChar = i > 0 ? content[i - 1] : '';

        // Handle escape sequences
        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        // Handle string literals
        if (!inRegex && (char === '"' || char === "'" || char === '`')) {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
            continue;
        }

        // Handle regex literals (only when not in a string)
        // Note: Regex detection is simplified - we only detect obvious cases
        // to avoid false positives that could break brace matching
        if (!inString) {
            // Regex starts with / when preceded by operators/separators
            if (char === '/' && prevChar !== '/' && i > openPos + 10) {
                // More conservative: only detect regex after common operators
                const regexStarters = /[=([,;:!&|?+\-*%^~]/;
                if (regexStarters.test(prevChar)) {
                    inRegex = true;
                    continue;
                }
            }
            // Regex ends with / followed by flags or punctuation
            if (inRegex && char === '/') {
                const nextChar = i + 1 < content.length ? content[i + 1] : '';
                if (/[gimsuvy]/.test(nextChar) || /[\s,;)\]}]/.test(nextChar)) {
                    inRegex = false;
                    continue;
                }
            }
        }

        // Only process braces when not in string or regex
        if (!inString && !inRegex) {
            if (char === '{') {
                depth++;
            } else if (char === '}') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
    }

    return -1; // No matching brace found
}
