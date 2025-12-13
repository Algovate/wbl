/**
 * API Endpoint Extractor
 * 
 * Extract API endpoints and HTTP methods from source code.
 */

/**
 * Extract API endpoints from source (e.g., /api/xxx, /nthl/api/xxx)
 */
export function extractApiEndpoints(source: string): string[] {
    const endpoints: Set<string> = new Set();

    // Match URL-like patterns in strings - more comprehensive patterns
    const patterns = [
        // Generic /api/ patterns
        /"\/([\w\/-]*api[\w\/-]*)"/gi,
        /'\/([\w\/-]*api[\w\/-]*)'/gi,
        // Path patterns with query/get/post method names
        /"\/([\w\/-]+\/(?:query|get|post|create|update|delete|fetch|save|load)[A-Z][\w]*)"/g,
        /'\/([\w\/-]+\/(?:query|get|post|create|update|delete|fetch|save|load)[A-Z][\w]*)'/g,
        // Common NHSA patterns
        /"(\/nthl\/[\w\/-]+)"/g,
        /'(\/nthl\/[\w\/-]+)'/g,
        // Web patterns
        /"(\/web\/[\w\/-]+)"/g,
        /'(\/web\/[\w\/-]+)'/g,
        // ebus patterns
        /"(\/ebus\/[\w\/-]+)"/g,
        /'(\/ebus\/[\w\/-]+)'/g,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(source)) !== null) {
            const endpoint = match[1];
            // Filter: length between 10-100, not just a single segment
            if (endpoint.length > 10 && endpoint.length < 100 &&
                endpoint.split('/').length > 2) {
                endpoints.add('/' + endpoint);
            }
        }
    }

    return [...endpoints].slice(0, 30); // Limit to 30
}

/**
 * Extract HTTP methods usage from source
 */
export function extractHttpMethods(source: string): string[] {
    const methods: Set<string> = new Set();

    // Common HTTP method patterns in code
    const patterns: [RegExp, string][] = [
        [/\.get\s*\(/gi, 'GET'],
        [/\.post\s*\(/gi, 'POST'],
        [/\.put\s*\(/gi, 'PUT'],
        [/\.delete\s*\(/gi, 'DELETE'],
        [/\.patch\s*\(/gi, 'PATCH'],
        [/method:\s*["']GET["']/gi, 'GET'],
        [/method:\s*["']POST["']/gi, 'POST'],
        [/method:\s*["']PUT["']/gi, 'PUT'],
        [/method:\s*["']DELETE["']/gi, 'DELETE'],
    ];

    for (const [pattern, method] of patterns) {
        if (pattern.test(source)) {
            methods.add(method);
        }
    }

    return [...methods];
}
