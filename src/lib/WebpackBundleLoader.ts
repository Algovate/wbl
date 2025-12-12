/**
 * WebpackBundleLoader
 * 
 * Core class for loading and executing webpack bundles.
 * Supports both main bundles and chunk formats.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BundleInfo {
    name: string;
    path: string;
    format: 'main' | 'chunk' | 'unknown';
    size: string;
    moduleCount: number;
    moduleIds: string[];
}

export interface LoadResult {
    bundles: { file: string; modules: number }[];
    totalModules: number;
}

interface WebpackModule {
    i: string;
    l: boolean;
    exports: Record<string, unknown>;
}

type ModuleFunction = (
    module: WebpackModule,
    exports: Record<string, unknown>,
    require: WebpackRequire
) => void;

interface WebpackRequire {
    (moduleId: string): unknown;
    r: (exports: Record<string, unknown>) => void;
    d: (exports: Record<string, unknown>, name: string, getter: () => unknown) => void;
    o: (obj: object, prop: string) => boolean;
    n: (module: unknown) => () => unknown;
    m: Record<string, ModuleFunction>;
    c: Record<string, WebpackModule>;
    p: string;
}

export class WebpackBundleLoader {
    private modules: Record<string, ModuleFunction> = {};
    private installedModules: Record<string, WebpackModule> = {};
    private bundleInfo: BundleInfo[] = [];

    /**
     * Load a webpack bundle file
     */
    loadBundle(filePath: string): number {
        const absolutePath = path.resolve(filePath);
        const bundleName = path.basename(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const sizeMB = (content.length / 1024 / 1024).toFixed(2);

        let newModules: Record<string, ModuleFunction> = {};
        let format: BundleInfo['format'] = 'unknown';

        // Chunk format: (window.webpackJsonp = ...).push([["ChunkName"], { modules }])
        if (content.startsWith('(window.webpackJsonp')) {
            format = 'chunk';
            const start = content.indexOf('], {');
            if (start !== -1) {
                const modulesPart = content.substring(start + 3).replace(/\}\s*\]\s*\)\s*;?\s*$/, '}');
                newModules = eval('(' + modulesPart + ')');
            }
        }
        // Main bundle format: !function(e) { ... }({ modules })
        else {
            format = 'main';
            const match = content.match(/\}\(\{/);
            if (match && match.index !== undefined) {
                const modulesPart = content.substring(match.index + 2).replace(/\);\s*$/, '');
                newModules = eval('(' + modulesPart + ')');
            }
        }

        const count = Object.keys(newModules).length;
        Object.assign(this.modules, newModules);

        this.bundleInfo.push({
            name: bundleName,
            path: absolutePath,
            format,
            size: sizeMB,
            moduleCount: count,
            moduleIds: Object.keys(newModules)
        });

        return count;
    }

    /**
     * Load multiple bundle files
     */
    loadBundles(filePaths: string[]): LoadResult {
        const results = filePaths.map(fp => ({
            file: path.basename(fp),
            modules: this.loadBundle(fp)
        }));
        return {
            bundles: results,
            totalModules: this.totalModules
        };
    }

    /**
     * Webpack require function
     */
    require(moduleId: string): unknown {
        if (this.installedModules[moduleId]) {
            return this.installedModules[moduleId].exports;
        }

        if (!this.modules[moduleId]) {
            throw new Error(`Module "${moduleId}" not found`);
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

        __webpack_require__.d = (exports, name, getter) => {
            if (!Object.prototype.hasOwnProperty.call(exports, name)) {
                Object.defineProperty(exports, name, { enumerable: true, get: getter });
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

        // Execute module
        this.modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
        return this.modules[moduleId].toString();
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
        this.modules = {};
        this.installedModules = {};
        this.bundleInfo = [];
    }
}

export default WebpackBundleLoader;
