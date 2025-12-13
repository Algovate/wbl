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
    let i = openPos;

    while (i < content.length) {
        const char = content[i];
        const nextChar = content[i + 1];

        // Skip comments
        if (char === '/' && nextChar === '/') {
            i = skipLineComment(content, i + 2);
            continue;
        }
        if (char === '/' && nextChar === '*') {
            i = skipBlockComment(content, i + 2);
            continue;
        }

        // Skip quoted strings
        if (char === '"' || char === "'") {
            i = skipQuotedString(content, i + 1, char);
            continue;
        }

        // Skip template literals (handles embedded expressions)
        if (char === '`') {
            i = skipTemplateLiteral(content, i + 1);
            continue;
        }

        if (char === '{') {
            depth++;
            i++;
            continue;
        }

        if (char === '}') {
            depth--;
            i++;
            if (depth === 0) {
                return i - 1;
            }
            continue;
        }

        i++;
    }

    return findMatchingBraceLenient(content, openPos);
}

function skipLineComment(content: string, start: number): number {
    let i = start;
    while (i < content.length && content[i] !== '\n') {
        i++;
    }
    return i;
}

function skipBlockComment(content: string, start: number): number {
    let i = start;
    while (i < content.length) {
        if (content[i] === '*' && content[i + 1] === '/') {
            return i + 2;
        }
        i++;
    }
    return content.length;
}

function skipQuotedString(content: string, start: number, quote: string): number {
    let i = start;
    while (i < content.length) {
        const char = content[i];
        if (char === '\\') {
            i += 2;
            continue;
        }
        if (char === quote) {
            return i + 1;
        }
        i++;
    }
    return content.length;
}

function skipTemplateLiteral(content: string, start: number): number {
    let i = start;
    while (i < content.length) {
        const char = content[i];
        if (char === '\\') {
            i += 2;
            continue;
        }
        if (char === '`') {
            return i + 1;
        }
        if (char === '$' && content[i + 1] === '{') {
            i = skipTemplateExpression(content, i + 2);
            continue;
        }
        i++;
    }
    return content.length;
}

function skipTemplateExpression(content: string, start: number): number {
    let depth = 1;
    let i = start;

    while (i < content.length) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '\\') {
            i += 2;
            continue;
        }

        if (char === '"' || char === "'") {
            i = skipQuotedString(content, i + 1, char);
            continue;
        }

        if (char === '`') {
            i = skipTemplateLiteral(content, i + 1);
            continue;
        }

        if (char === '/' && nextChar === '/') {
            i = skipLineComment(content, i + 2);
            continue;
        }

        if (char === '/' && nextChar === '*') {
            i = skipBlockComment(content, i + 2);
            continue;
        }

        if (char === '{') {
            depth++;
            i++;
            continue;
        }

        if (char === '}') {
            depth--;
            i++;
            if (depth === 0) {
                return i;
            }
            continue;
        }

        i++;
    }

    return content.length;
}

function findMatchingBraceLenient(content: string, openPos: number): number {
    if (openPos < 0 || openPos >= content.length || content[openPos] !== '{') {
        return -1;
    }

    let depth = 0;
    for (let i = openPos; i < content.length; i++) {
        const char = content[i];
        if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}
