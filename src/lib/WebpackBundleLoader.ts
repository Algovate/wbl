/**
 * WebpackBundleLoader
 * 
 * Core class for loading and executing webpack bundles.
 * Supports Webpack 4 (main/chunk) and Webpack 5 (IIFE/UMD) formats.
 * Includes optional source map integration for viewing original source code.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ModuleNotFoundError, ModuleExecutionError } from './errors.js';
import { parseBundle } from './parsers/index.js';
import type { ModuleFunction, WebpackModule, WebpackRequire, BundleFormat } from './parsers/types.js';
import { SourceMapResolver } from './utils/sourceMap.js';

/**
 * Options for loading a bundle
 */
export interface LoadBundleOptions {
    /** Auto-load source map if available (.map file or inline) */
    loadSourceMap?: boolean;
}

/**
 * Information about a loaded bundle
 */
export interface BundleInfo {
    name: string;
    path: string;
    format: BundleFormat;
    size: string;
    moduleCount: number;
    moduleIds: string[];
    /** Source map resolver (if loaded) */
    sourceMap?: SourceMapResolver;
    /** Whether source map was loaded */
    hasSourceMap: boolean;
}

export interface LoadResult {
    bundles: { file: string; modules: number }[]
    totalModules: number;
}

// Re-export types from parsers for backwards compatibility
export type { ModuleFunction, WebpackModule, WebpackRequire };

export class WebpackBundleLoader {
    private modules: Record<string, ModuleFunction> = {};
    private installedModules: Record<string, WebpackModule> = {};
    private bundleInfo: BundleInfo[] = [];

    /**
     * Load a webpack bundle file
     * @param filePath Path to the bundle file
     * @param options Loading options (e.g., whether to load source map)
     */
    async loadBundle(filePath: string, options: LoadBundleOptions = {}): Promise<number> {
        const absolutePath = path.resolve(filePath);
        const bundleName = path.basename(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const sizeMB = (content.length / 1024 / 1024).toFixed(2);

        // Use the parser factory to parse the bundle
        const { modules, format } = parseBundle(content, bundleName);

        const count = Object.keys(modules).length;
        Object.assign(this.modules, modules);

        // Create bundle info
        const info: BundleInfo = {
            name: bundleName,
            path: absolutePath,
            format,
            size: sizeMB,
            moduleCount: count,
            moduleIds: Object.keys(modules),
            hasSourceMap: false,
        };

        // Try to load source map if requested
        if (options.loadSourceMap) {
            const resolver = new SourceMapResolver();
            try {
                const loaded = await resolver.loadFromBundle(absolutePath);
                if (loaded) {
                    info.sourceMap = resolver;
                    info.hasSourceMap = true;
                }
            } catch {
                // Source map loading failed, continue without it
            }
        }

        this.bundleInfo.push(info);
        return count;
    }

    /**
     * Synchronous bundle loading (legacy, without source map support)
     */
    loadBundleSync(filePath: string): number {
        const absolutePath = path.resolve(filePath);
        const bundleName = path.basename(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const sizeMB = (content.length / 1024 / 1024).toFixed(2);

        const { modules, format } = parseBundle(content, bundleName);

        const count = Object.keys(modules).length;
        Object.assign(this.modules, modules);

        this.bundleInfo.push({
            name: bundleName,
            path: absolutePath,
            format,
            size: sizeMB,
            moduleCount: count,
            moduleIds: Object.keys(modules),
            hasSourceMap: false,
        });

        return count;
    }

    /**
     * Load multiple bundle files
     * Continues loading even if some bundles fail
     */
    loadBundles(filePaths: string[]): LoadResult {
        const results = filePaths.map(fp => {
            try {
                const modules = this.loadBundleSync(fp);
                return {
                    file: path.basename(fp),
                    modules
                };
            } catch (error) {
                // Log error but continue with other bundles
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(`Failed to load bundle ${fp}: ${errorMessage}`);
                return {
                    file: path.basename(fp),
                    modules: 0
                };
            }
        });
        return {
            bundles: results,
            totalModules: this.totalModules
        };
    }

    // Hooks system
    private hooks: {
        beforeExecute: Array<(moduleId: string, module: WebpackModule) => void>;
    } = {
            beforeExecute: []
        };

    /**
     * Add a hook to intercept loader events
     */
    addHook(type: 'beforeExecute', callback: (moduleId: string, module: WebpackModule) => void): void {
        if (this.hooks[type]) {
            this.hooks[type].push(callback);
        }
    }

    /**
     * Webpack require function
     */
    require(moduleId: string): unknown {
        if (this.installedModules[moduleId]) {
            return this.installedModules[moduleId].exports;
        }

        if (!this.modules[moduleId]) {
            throw new ModuleNotFoundError(moduleId);
        }

        const module: WebpackModule = this.installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        const __webpack_require__: WebpackRequire = function (id: string) {
            return self.require(id);
        } as WebpackRequire;

        // Webpack helper functions
        __webpack_require__.r = (exports) => {
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
            }
            Object.defineProperty(exports, '__esModule', { value: true });
        };

        // Webpack 5 uses: __webpack_require__.d(exports, { name: () => value })
        // Webpack 4 uses: __webpack_require__.d(exports, name, getter)
        __webpack_require__.d = (exports, nameOrDefinition, getter?) => {
            if (typeof nameOrDefinition === 'string' && getter) {
                // Webpack 4 format: d(exports, name, getter)
                if (!Object.prototype.hasOwnProperty.call(exports, nameOrDefinition)) {
                    Object.defineProperty(exports, nameOrDefinition, { enumerable: true, get: getter });
                }
            } else if (typeof nameOrDefinition === 'object') {
                // Webpack 5 format: d(exports, { name: () => value, ... })
                for (const key in nameOrDefinition) {
                    if (Object.prototype.hasOwnProperty.call(nameOrDefinition, key) &&
                        !Object.prototype.hasOwnProperty.call(exports, key)) {
                        Object.defineProperty(exports, key, {
                            enumerable: true,
                            get: nameOrDefinition[key] as () => unknown
                        });
                    }
                }
            }
        };

        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

        __webpack_require__.n = (mod: unknown) => {
            const getter = (mod as { __esModule?: boolean })?.['__esModule']
                ? () => (mod as { default: unknown })['default']
                : () => mod;
            __webpack_require__.d(getter as unknown as Record<string, unknown>, 'a', getter);
            return getter;
        };

        __webpack_require__.m = this.modules;
        __webpack_require__.c = this.installedModules;
        __webpack_require__.p = '';

        // Execute hooks
        this.hooks.beforeExecute.forEach(hook => hook(moduleId, module));

        // Execute module with error context
        try {
            this.modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        } catch (error) {
            if (error instanceof Error) {
                throw new ModuleExecutionError(moduleId, error);
            }
            throw new ModuleExecutionError(moduleId, new Error(String(error)));
        }
        module.l = true;

        return module.exports;
    }

    /**
     * Get list of all module IDs
     */
    getModuleIds(): string[] {
        return Object.keys(this.modules);
    }

    /**
     * Get exports of a module
     */
    getModuleExports(moduleId: string): unknown {
        return this.require(moduleId);
    }

    /**
     * Get module source code
     */
    getModuleSource(moduleId: string): string | null {
        if (!this.modules[moduleId]) {
            return null;
        }
        try {
            return this.modules[moduleId].toString();
        } catch {
            return '[Native or bound function]';
        }
    }

    /**
     * Get original source from source map (if available)
     * 
     * Note: Module IDs in webpack bundles (e.g., "b381", "7d92") don't directly
     * map to source file paths. This method uses heuristics to find matching sources.
     * For precise mapping, use SourceMapResolver.mapPosition() with known line/column.
     * 
     * @param moduleId - The webpack module ID
     * @returns Original source content or null if not found
     */
    getOriginalSource(moduleId: string): string | null {
        // Find which bundle contains this module
        for (const bundle of this.bundleInfo) {
            if (!bundle.moduleIds.includes(moduleId) || !bundle.sourceMap) {
                continue;
            }

            const sources = bundle.sourceMap.getSources();
            if (sources.length === 0) {
                continue;
            }

            // Normalize module ID for matching (remove common prefixes/suffixes)
            const normalizedModuleId = moduleId.toLowerCase().replace(/[^a-z0-9]/g, '');

            // Try multiple matching strategies
            // 1. Exact match in source path
            let matchingSource = sources.find(s => 
                s.toLowerCase().includes(moduleId.toLowerCase())
            );

            // 2. Match by basename without extension
            if (!matchingSource) {
                const moduleBase = normalizedModuleId;
                matchingSource = sources.find(s => {
                    const sourceBase = path.basename(s, path.extname(s))
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '');
                    return sourceBase.includes(moduleBase) || moduleBase.includes(sourceBase);
                });
            }

            // 3. Try matching numeric IDs with file indices
            if (!matchingSource && /^\d+$/.test(moduleId)) {
                const index = parseInt(moduleId, 10);
                if (index >= 0 && index < sources.length) {
                    matchingSource = sources[index];
                }
            }

            // If we found a match, return its content
            if (matchingSource) {
                const content = bundle.sourceMap.getSourceContent(matchingSource);
                if (content) {
                    return content;
                }
            }

            // Fallback: return first non-empty source as last resort
            for (const source of sources) {
                const content = bundle.sourceMap.getSourceContent(source);
                if (content && content.trim().length > 0) {
                    return content;
                }
            }
        }
        return null;
    }

    /**
     * Get source map resolver for a bundle
     */
    getSourceMapResolver(bundleName: string): SourceMapResolver | null {
        const bundle = this.bundleInfo.find(b => b.name === bundleName);
        return bundle?.sourceMap ?? null;
    }

    /**
     * Check if a module exists
     */
    hasModule(moduleId: string): boolean {
        return moduleId in this.modules;
    }

    /**
     * Get total number of modules
     */
    get totalModules(): number {
        return Object.keys(this.modules).length;
    }

    /**
     * Get bundle information
     */
    getBundleInfo(): BundleInfo[] {
        return this.bundleInfo;
    }

    /**
     * Reset the loader state
     */
    reset(): void {
        // Destroy source map consumers
        for (const bundle of this.bundleInfo) {
            bundle.sourceMap?.destroy();
        }
        this.modules = {};
        this.installedModules = {};
        this.bundleInfo = [];
    }
}

export default WebpackBundleLoader;
