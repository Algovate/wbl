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
import {
    extractApiEndpoints,
    extractHttpMethods,
    extractMeaningfulStrings,
    categorizeModule,
    extractFunctionNames,
    getFunctionSignature,
    getFunctionBodySnippet,
} from './extractors/index.js';

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
        try {
            const exports = this.loader.getModuleExports(moduleId);

            if (exports === undefined || exports === null) {
                return {
                    moduleId,
                    type: exports === null ? 'null' : 'undefined',
                    isEsModule: false,
                    exports: {}
                };
            }

            const isEsModule = typeof exports === 'object' &&
                (exports as { __esModule?: boolean }).__esModule === true;

            const exportsMap: Record<string, ExportInfo> = {};

            if (typeof exports === 'object') {
                for (const [key, value] of Object.entries(exports as object)) {
                    const isFunction = typeof value === 'function';
                    const isClass = isFunction && /^class\s/.test(Function.prototype.toString.call(value));

                    const info: ExportInfo = {
                        type: typeof value,
                        isFunction,
                        isClass,
                        preview: this.getValuePreview(value)
                    };

                    if (isFunction) {
                        info.signature = this.getFunctionSignature(value);
                        info.bodySnippet = this.getFunctionBodySnippet(value);
                    }

                    exportsMap[key] = info;
                }
            }

            return {
                moduleId,
                type: typeof exports,
                isEsModule,
                exports: exportsMap
            };
        } catch (error) {
            return {
                moduleId,
                type: 'error',
                isEsModule: false,
                exports: {},
                error: (error as Error).message
            };
        }
    }

    /**
     * Analyze dependencies of a module (modules it requires)
     */
    analyzeDependencies(moduleId: string): DependencyAnalysis {
        try {
            const source = this.loader.getModuleSource(moduleId);
            if (!source) {
                return {
                    moduleId,
                    dependencies: [],
                    count: 0,
                    error: 'Could not get module source'
                };
            }

            const deps: Set<string> = new Set();

            // Try all require patterns
            // Reset lastIndex to avoid state issues with global regex patterns
            for (const pattern of REQUIRE_PATTERNS) {
                pattern.lastIndex = 0; // Reset global regex state
                let match;
                while ((match = pattern.exec(source)) !== null) {
                    deps.add(match[1]);
                }
            }

            const dependencies = [...deps];
            return {
                moduleId,
                dependencies,
                count: dependencies.length
            };
        } catch (error) {
            return {
                moduleId,
                dependencies: [],
                count: 0,
                error: (error as Error).message
            };
        }
    }

    /**
     * Find modules that depend on the given module
     */
    findDependents(moduleId: string): DependentsAnalysis {
        const dependents: string[] = [];

        for (const id of this.loader.getModuleIds()) {
            if (id === moduleId) continue;

            const source = this.loader.getModuleSource(id);
            if (source) {
                // Check if this module requires the target module
                // Reset lastIndex to avoid state issues with global regex patterns
                for (const pattern of REQUIRE_PATTERNS) {
                    pattern.lastIndex = 0; // Reset global regex state
                    let match;
                    while ((match = pattern.exec(source)) !== null) {
                        if (match[1] === moduleId) {
                            dependents.push(id);
                            break;
                        }
                    }
                }
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
        const results: SearchMatch[] = [];
        const lowerPattern = pattern.toLowerCase();

        for (const id of this.loader.getModuleIds()) {
            // Search in module ID
            if (id.toLowerCase().includes(lowerPattern)) {
                results.push({ id, matchType: 'id' });
                continue;
            }

            // Search in source
            const source = this.loader.getModuleSource(id);
            if (source && source.toLowerCase().includes(lowerPattern)) {
                results.push({ id, matchType: 'source' });
            }
        }

        return results.slice(0, LIMITS.SEARCH_RESULTS);
    }

    /**
     * Call a method on a module
     */
    callMethod(moduleId: string, methodName: string, args: unknown[] = []): unknown {
        const exports = this.loader.getModuleExports(moduleId);

        if (!exports || typeof exports !== 'object') {
            throw new Error(`Module ${moduleId} has no exports`);
        }

        const method = (exports as Record<string, unknown>)[methodName];

        if (typeof method !== 'function') {
            throw new Error(`${methodName} is not a function on module ${moduleId}`);
        }

        return method.apply(exports, args);
    }

    /**
     * Get summary of loaded bundles and modules
     */
    getSummary(): BundleSummary {
        const bundleInfo = this.loader.getBundleInfo();
        return {
            bundles: bundleInfo.map(b => ({
                name: b.name,
                format: b.format,
                size: b.size,
                modules: b.moduleCount
            })),
            totalModules: this.loader.totalModules
        };
    }

    /**
     * Preview a value for display
     */
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

    /**
     * Get function signature for display
     */
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

    /**
     * Get a snippet of the function body
     */
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
     * Uses extractors from ./extractors/ for the actual extraction
     */
    analyzeSource(moduleId: string): SourceAnalysis {
        const source = this.loader.getModuleSource(moduleId) || '';
        const deps = this.analyzeDependencies(moduleId);

        return {
            moduleId,
            apiEndpoints: extractApiEndpoints(source),
            httpMethods: extractHttpMethods(source),
            strings: extractMeaningfulStrings(source),
            category: categorizeModule(source),
            functionNames: extractFunctionNames(source),
            dependencies: deps.dependencies,
            sourceLength: source.length
        };
    }
}

export default ModuleAnalyzer;
