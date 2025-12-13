/**
 * ModuleAnalyzer
 * 
 * Utilities for analyzing webpack modules:
 * - List exports
 * - Analyze dependencies
 * - Search modules
 */

import { WebpackBundleLoader } from './WebpackBundleLoader.js';
import { REQUIRE_PATTERNS, LIMITS } from './constants.js';

export interface ModuleInfo {
    id: string;
    preview: string;
}

export interface ExportInfo {
    type: string;
    isFunction: boolean;
    isClass: boolean;
    preview: string;
    signature?: string;     // Function signature (params)
    bodySnippet?: string;   // First 100 chars of function body
}

export interface ExportAnalysis {
    moduleId: string;
    type: string;
    isEsModule: boolean;
    exports: Record<string, ExportInfo>;
    error?: string;
}

export interface DependencyAnalysis {
    moduleId: string;
    dependencies: string[];
    count: number;
    error?: string;
}

export interface DependentsAnalysis {
    moduleId: string;
    dependents: string[];
    count: number;
}

export interface SearchMatch {
    id: string;
    matchType: 'id' | 'source';
}

export interface BundleSummary {
    bundles: {
        name: string;
        format: string;
        size: string;
        modules: number;
    }[];
    totalModules: number;
}

/**
 * Source-based analysis results
 */
export interface SourceAnalysis {
    moduleId: string;
    /** API endpoints found in source (e.g., /api/xxx) */
    apiEndpoints: string[];
    /** HTTP methods found (GET, POST, PUT, DELETE) */
    httpMethods: string[];
    /** Meaningful strings (URLs, error messages, etc.) */
    strings: string[];
    /** Likely category based on content */
    category: string[];
    /** Function/method names found in source */
    functionNames: string[];
    /** Dependencies (modules this module requires) */
    dependencies: string[];
    /** Source code length */
    sourceLength: number;
}

export class ModuleAnalyzer {
    constructor(private loader: WebpackBundleLoader) { }

    /**
     * Get all module IDs with basic info
     */
    listModules(): ModuleInfo[] {
        return this.loader.getModuleIds().map(id => {
            const source = this.loader.getModuleSource(id);
            const preview = source ? source.substring(0, 100).replace(/\s+/g, ' ') : '';
            return {
                id,
                preview: preview.length >= 100 ? preview + '...' : preview
            };
        });
    }

    /**
     * Analyze exports of a module
     */
    analyzeExports(moduleId: string): ExportAnalysis {
        if (!this.loader.hasModule(moduleId)) {
            return {
                moduleId,
                type: 'unknown',
                isEsModule: false,
                exports: {},
                error: `Module "${moduleId}" not found`
            };
        }

        try {
            const exports = this.loader.getModuleExports(moduleId) as Record<string, unknown>;
            const result: ExportAnalysis = {
                moduleId,
                type: typeof exports,
                isEsModule: exports && (exports as { __esModule?: boolean }).__esModule === true,
                exports: {}
            };

            if (exports && typeof exports === 'object') {
                for (const key of Object.keys(exports)) {
                    if (key === '__esModule') continue;
                    const value = exports[key];
                    const exportInfo: ExportInfo = {
                        type: typeof value,
                        isFunction: typeof value === 'function',
                        isClass: typeof value === 'function' && /^class\s/.test(value.toString()),
                        preview: this.getValuePreview(value)
                    };
                    // Add function details
                    if (typeof value === 'function') {
                        exportInfo.signature = this.getFunctionSignature(value);
                        exportInfo.bodySnippet = this.getFunctionBodySnippet(value);
                    }
                    result.exports[key] = exportInfo;
                }
            } else if (typeof exports === 'function') {
                result.exports['default'] = {
                    type: 'function',
                    isFunction: true,
                    isClass: /^class\s/.test(Function.prototype.toString.call(exports)),
                    preview: (exports as { name?: string }).name || '(anonymous)'
                };
            }

            return result;
        } catch (e) {
            return {
                moduleId,
                type: 'unknown',
                isEsModule: false,
                exports: {},
                error: (e as Error).message
            };
        }
    }

    /**
     * Analyze dependencies of a module (modules it requires)
     */
    analyzeDependencies(moduleId: string): DependencyAnalysis {
        if (!this.loader.hasModule(moduleId)) {
            return {
                moduleId,
                dependencies: [],
                count: 0,
                error: `Module "${moduleId}" not found`
            };
        }

        const source = this.loader.getModuleSource(moduleId) || '';
        const deps: string[] = [];

        // Match various require patterns in webpack modules
        // Patterns are defined in constants.ts
        for (const pattern of REQUIRE_PATTERNS) {
            // Create a new RegExp to avoid state issues with global flag
            const regex = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = regex.exec(source)) !== null) {
                if (!deps.includes(match[1])) {
                    deps.push(match[1]);
                }
            }
        }



        return {
            moduleId,
            dependencies: deps,
            count: deps.length
        };
    }

    /**
     * Find modules that depend on the given module
     */
    findDependents(moduleId: string): DependentsAnalysis {
        const dependents: string[] = [];

        for (const id of this.loader.getModuleIds()) {
            const source = this.loader.getModuleSource(id);
            if (source && (
                source.includes(`"${moduleId}"`) ||
                source.includes(`'${moduleId}'`)
            )) {
                dependents.push(id);
            }
        }

        return {
            moduleId,
            dependents,
            count: dependents.length
        };
    }

    /**
     * Search modules by pattern
     */
    searchModules(pattern: string): SearchMatch[] {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        const matches: SearchMatch[] = [];

        for (const id of this.loader.getModuleIds()) {
            if (regex.test(id)) {
                matches.push({ id, matchType: 'id' });
                continue;
            }

            const source = this.loader.getModuleSource(id);
            if (source && regex.test(source)) {
                matches.push({ id, matchType: 'source' });
            }
        }

        return matches;
    }

    /**
     * Call a method on a module
     */
    callMethod(moduleId: string, methodName: string, args: unknown[] = []): unknown {
        const exports = this.loader.getModuleExports(moduleId) as Record<string, unknown>;

        if (!exports) {
            throw new Error(`Module "${moduleId}" not found or has no exports`);
        }

        const method = exports[methodName];

        if (typeof method !== 'function') {
            throw new Error(`"${methodName}" is not a function in module "${moduleId}"`);
        }

        return method.apply(exports, args);
    }

    /**
     * Get summary of loaded bundles and modules
     */
    getSummary(): BundleSummary {
        const bundles = this.loader.getBundleInfo();
        const moduleCount = this.loader.totalModules;

        return {
            bundles: bundles.map(b => ({
                name: b.name,
                format: b.format,
                size: `${b.size} MB`,
                modules: b.moduleCount
            })),
            totalModules: moduleCount
        };
    }

    private getValuePreview(value: unknown): string {
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
                return value.length > LIMITS.VALUE_PREVIEW ? value.substring(0, LIMITS.VALUE_PREVIEW) + '...' : value;
            default:
                return String(value);
        }
    }

    private getFunctionSignature(fn: unknown): string {
        const fnStr = Function.prototype.toString.call(fn);
        // Extract parameters from function(a, b, c) or (a, b, c) =>
        const match = fnStr.match(/^(?:function\s*\w*\s*)?\(([^)]*)\)/);
        if (match) {
            const params = match[1].trim();
            return params ? `(${params})` : '()';
        }
        // Arrow function with single param: a =>
        const arrowMatch = fnStr.match(/^(\w+)\s*=>/);
        if (arrowMatch) {
            return `(${arrowMatch[1]})`;
        }
        return '(?)';
    }

    private getFunctionBodySnippet(fn: unknown): string {
        const fnStr = Function.prototype.toString.call(fn);
        // Remove function header and get body
        const bodyStart = fnStr.indexOf('{');
        if (bodyStart === -1) {
            // Arrow function with expression body
            const arrowIdx = fnStr.indexOf('=>');
            if (arrowIdx !== -1) {
                const body = fnStr.substring(arrowIdx + 2).trim();
                return body.length > LIMITS.BODY_SNIPPET ? body.substring(0, LIMITS.BODY_SNIPPET) + '...' : body;
            }
            return '';
        }
        const body = fnStr.substring(bodyStart + 1, fnStr.lastIndexOf('}'))
            .trim()
            .replace(/\s+/g, ' ');
        return body.length > LIMITS.BODY_SNIPPET ? body.substring(0, LIMITS.BODY_SNIPPET) + '...' : body;
    }

    /**
     * Analyze module source code to extract useful information
     */
    analyzeSource(moduleId: string): SourceAnalysis {
        const source = this.loader.getModuleSource(moduleId) || '';
        const deps = this.analyzeDependencies(moduleId);

        return {
            moduleId,
            apiEndpoints: this.extractApiEndpoints(source),
            httpMethods: this.extractHttpMethods(source),
            strings: this.extractMeaningfulStrings(source),
            category: this.categorizeModule(source),
            functionNames: this.extractFunctionNames(source),
            dependencies: deps.dependencies,
            sourceLength: source.length
        };
    }

    /**
     * Extract API endpoints from source (e.g., /api/xxx, /nthl/api/xxx)
     */
    private extractApiEndpoints(source: string): string[] {
        const endpoints: Set<string> = new Set();

        // Match URL-like patterns in strings - more comprehensive patterns
        const patterns = [
            // Generic /api/ patterns
            /"(\/[a-zA-Z0-9/_-]*api[a-zA-Z0-9/_-]*)"/gi,
            /'(\/[a-zA-Z0-9/_-]*api[a-zA-Z0-9/_-]*)'/gi,
            // Path patterns with query/get/post method names
            /"(\/[a-zA-Z0-9/_-]+\/(?:query|get|post|create|update|delete|fetch|save|load)[A-Z][a-zA-Z0-9]*)"/g,
            /'(\/[a-zA-Z0-9/_-]+\/(?:query|get|post|create|update|delete|fetch|save|load)[A-Z][a-zA-Z0-9]*)'/g,
            // Common NHSA patterns
            /"(\/nthl\/[a-zA-Z0-9/_-]+)"/g,
            /'(\/nthl\/[a-zA-Z0-9/_-]+)'/g,
            // Web patterns
            /"(\/web\/[a-zA-Z0-9/_-]+)"/g,
            /'(\/web\/[a-zA-Z0-9/_-]+)'/g,
            // ebus patterns
            /"(\/ebus\/[a-zA-Z0-9/_-]+)"/g,
            /'(\/ebus\/[a-zA-Z0-9/_-]+)'/g,
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(source)) !== null) {
                const endpoint = match[1];
                // Filter: length between 10-100, not just a single segment
                if (endpoint.length > 10 && endpoint.length < 100 &&
                    endpoint.split('/').length > 2) {
                    endpoints.add(endpoint);
                }
            }
        }

        return [...endpoints].slice(0, 30); // Limit to 30
    }

    /**
     * Extract HTTP methods usage from source
     */
    private extractHttpMethods(source: string): string[] {
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

    /**
     * Extract meaningful strings from source (URLs, error messages, etc.)
     */
    private extractMeaningfulStrings(source: string): string[] {
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

    /**
     * Categorize module based on source content
     */
    private categorizeModule(source: string): string[] {
        const categories: string[] = [];
        const lowerSource = source.toLowerCase();

        // Check for various patterns
        if (lowerSource.includes('encrypt') || lowerSource.includes('decrypt') ||
            lowerSource.includes('sm2') || lowerSource.includes('sm4') ||
            lowerSource.includes('aes') || lowerSource.includes('rsa')) {
            categories.push('crypto');
        }

        if (lowerSource.includes('axios') || lowerSource.includes('fetch') ||
            lowerSource.includes('.post(') || lowerSource.includes('.get(') ||
            source.includes('XMLHttpRequest')) {
            categories.push('http');
        }

        if (source.includes('/api/') || source.includes('.api.')) {
            categories.push('api');
        }

        if (lowerSource.includes('vue') || lowerSource.includes('react') ||
            lowerSource.includes('component') || source.includes('render(')) {
            categories.push('component');
        }

        if (lowerSource.includes('router') || lowerSource.includes('route')) {
            categories.push('router');
        }

        if (lowerSource.includes('store') || lowerSource.includes('vuex') ||
            lowerSource.includes('redux') || lowerSource.includes('state')) {
            categories.push('store');
        }

        if (lowerSource.includes('localstorage') || lowerSource.includes('sessionstorage') ||
            lowerSource.includes('cookie')) {
            categories.push('storage');
        }

        if (lowerSource.includes('validate') || lowerSource.includes('validator')) {
            categories.push('validation');
        }

        if (lowerSource.includes('format') || lowerSource.includes('parse') ||
            lowerSource.includes('stringify')) {
            categories.push('util');
        }

        return categories;
    }

    /**
     * Extract function/method names from source
     */
    private extractFunctionNames(source: string): string[] {
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
}

export default ModuleAnalyzer;
