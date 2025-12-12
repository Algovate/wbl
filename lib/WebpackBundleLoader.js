/**
 * WebpackBundleLoader
 * 
 * Core class for loading and executing webpack bundles.
 * Supports both main bundles and chunk formats.
 */

const fs = require('fs');
const path = require('path');

class WebpackBundleLoader {
    constructor() {
        this.modules = {};
        this.installedModules = {};
        this.bundleInfo = [];
    }

    /**
     * Load a webpack bundle file
     * @param {string} filePath - Path to the bundle file
     * @returns {number} Number of modules loaded
     */
    loadBundle(filePath) {
        const absolutePath = path.resolve(filePath);
        const bundleName = path.basename(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        const sizeMB = (content.length / 1024 / 1024).toFixed(2);

        let newModules = {};
        let format = 'unknown';

        // Chunk format: (window.webpackJsonp = ...).push([["ChunkName"], { modules }])
        if (content.startsWith('(window.webpackJsonp')) {
            format = 'chunk';
            const start = content.indexOf('], {');
            if (start !== -1) {
                let modulesPart = content.substring(start + 3).replace(/\}\s*\]\s*\)\s*;?\s*$/, '}');
                newModules = eval('(' + modulesPart + ')');
            }
        }
        // Main bundle format: !function(e) { ... }({ modules })
        else {
            format = 'main';
            const match = content.match(/\}\(\{/);
            if (match) {
                let modulesPart = content.substring(match.index + 2).replace(/\);\s*$/, '');
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
     * @param {string[]} filePaths - Array of bundle file paths
     * @returns {Object} Summary of loaded bundles
     */
    loadBundles(filePaths) {
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
     * @param {string} moduleId - Module ID to require
     * @returns {Object} Module exports
     */
    require(moduleId) {
        if (this.installedModules[moduleId]) {
            return this.installedModules[moduleId].exports;
        }

        if (!this.modules[moduleId]) {
            throw new Error(`Module "${moduleId}" not found`);
        }

        const module = this.installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };

        const __webpack_require__ = this.require.bind(this);

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

        __webpack_require__.n = (module) => {
            const getter = module && module.__esModule ? () => module['default'] : () => module;
            __webpack_require__.d(getter, 'a', getter);
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
     * @returns {string[]} Array of module IDs
     */
    getModuleIds() {
        return Object.keys(this.modules);
    }

    /**
     * Get exports of a module
     * @param {string} moduleId - Module ID
     * @returns {Object} Module exports
     */
    getModuleExports(moduleId) {
        return this.require(moduleId);
    }

    /**
     * Get module source code
     * @param {string} moduleId - Module ID
     * @returns {string} Module source code
     */
    getModuleSource(moduleId) {
        if (!this.modules[moduleId]) {
            return null;
        }
        return this.modules[moduleId].toString();
    }

    /**
     * Check if a module exists
     * @param {string} moduleId - Module ID
     * @returns {boolean} True if module exists
     */
    hasModule(moduleId) {
        return moduleId in this.modules;
    }

    /**
     * Get total number of modules
     */
    get totalModules() {
        return Object.keys(this.modules).length;
    }

    /**
     * Get bundle information
     * @returns {Object[]} Array of bundle info objects
     */
    getBundleInfo() {
        return this.bundleInfo;
    }

    /**
     * Reset the loader state
     */
    reset() {
        this.modules = {};
        this.installedModules = {};
        this.bundleInfo = [];
    }
}

module.exports = WebpackBundleLoader;
