/**
 * String Extractor
 * 
 * Extract meaningful strings from source code.
 */

/**
 * Extract meaningful strings from source (URLs, error messages, etc.)
 */
export function extractMeaningfulStrings(source: string): string[] {
    const strings: Set<string> = new Set();

    // Match quoted strings
    const stringPattern = /["']([^"']{10,80})["']/g;
    let match;

    while ((match = stringPattern.exec(source)) !== null) {
        const str = match[1];
        // Filter for meaningful strings
        if (
            str.includes('http') ||
            str.includes('Error') ||
            str.includes('error') ||
            str.includes('query') ||
            str.includes('Query') ||
            str.includes('Service') ||
            str.includes('encrypt') ||
            str.includes('decrypt') ||
            str.match(/^[A-Z][a-z]+[A-Z]/) || // camelCase names
            str.match(/^[a-z]+_[a-z]+/) // snake_case names
        ) {
            strings.add(str);
        }
    }

    return [...strings].slice(0, 15); // Limit to 15
}
