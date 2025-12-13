/**
 * Brace/bracket parsing utilities
 */

/**
 * Find the matching closing brace for an opening brace at the given position.
 * Handles nested braces, brackets, parentheses, and string literals.
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
    let escapeNext = false;

    for (let i = openPos; i < content.length; i++) {
        const char = content[i];

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
        if (char === '"' || char === "'" || char === '`') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = null;
            }
            continue;
        }

        // Only process braces when not in string
        if (!inString) {
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
