/**
 * ModuleAnalyzer
 * 
 * Utilities for analyzing webpack modules:
 * - List exports
 * - Analyze dependencies
 * - Search modules
 */

import { WebpackBundleLoader } from './WebpackBundleLoader.js';

export interface ModuleInfo {
    id: string;
    preview: string;
}

export interface ExportInfo {
    type: string;
    isFunction: boolean;
    isClass: boolean;
    preview: string;
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
                    result.exports[key] = {
                        type: typeof value,
                        isFunction: typeof value === 'function',
                        isClass: typeof value === 'function' && /^class\s/.test(value.toString()),
                        preview: this.getValuePreview(value)
                    };
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
        const patterns = [
            /\be\s*\(\s*["']([^"']+)["']\s*\)/g,  // e("moduleId")
            /\bt\s*\(\s*["']([^"']+)["']\s*\)/g,  // t("moduleId")
            /\bn\s*\(\s*["']([^"']+)["']\s*\)/g,  // n("moduleId")
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(source)) !== null) {
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
                return value.length > 50 ? value.substring(0, 50) + '...' : value;
            default:
                return String(value);
        }
    }
}

export default ModuleAnalyzer;
