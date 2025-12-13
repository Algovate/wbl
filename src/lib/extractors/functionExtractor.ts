/**
 * Function Extractor
 * 
 * Extract function names and signatures from source code.
 */

/**
 * Extract function/method names from source
 */
export function extractFunctionNames(source: string): string[] {
    const names: Set<string> = new Set();

    // Match function declarations and assignments
    const patterns = [
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]{2,})\s*\(/g,
        /([a-zA-Z_$][a-zA-Z0-9_$]{2,})\s*[:=]\s*function/g,
        /([a-zA-Z_$][a-zA-Z0-9_$]{2,})\s*[:=]\s*\([^)]*\)\s*=>/g,
        /\.([a-zA-Z_$][a-zA-Z0-9_$]{2,})\s*=\s*function/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source)) !== null) {
            const name = match[1];
            // Filter out common minified names and keywords
            if (name.length > 2 && !['undefined', 'function', 'return', 'this'].includes(name)) {
                names.add(name);
            }
        }
    }

    // Also look for meaningful method calls that might indicate functionality
    const methodPatterns = [
        /\.(query[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(get[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(set[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(create[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(update[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(delete[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(fetch[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(load[A-Z][a-zA-Z]+)\s*\(/g,
        /\.(save[A-Z][a-zA-Z]+)\s*\(/g,
    ];

    for (const pattern of methodPatterns) {
        let match;
        while ((match = pattern.exec(source)) !== null) {
            names.add(match[1]);
        }
    }

    return [...names].slice(0, 25); // Limit to 25
}

/**
 * Get function signature from a function
 */
export function getFunctionSignature(fn: unknown): string {
    if (typeof fn !== 'function') {
        return '';
    }
    const str = fn.toString();
    // Extract just the signature (up to opening brace)
    const match = str.match(/^[^{]+/);
    if (match) {
        return match[0].trim().replace(/\s+/g, ' ');
    }
    return str.substring(0, 50);
}

/**
 * Get a snippet of the function body
 */
export function getFunctionBodySnippet(fn: unknown, maxLength = 100): string {
    if (typeof fn !== 'function') {
        return '';
    }
    const str = fn.toString();
    const bodyStart = str.indexOf('{');
    if (bodyStart === -1) {
        // Arrow function without braces
        const arrowPos = str.indexOf('=>');
        if (arrowPos !== -1) {
            return str.substring(arrowPos + 2).trim().substring(0, maxLength);
        }
        return '';
    }
    const body = str.substring(bodyStart + 1, str.lastIndexOf('}'));
    return body.trim().substring(0, maxLength);
}
