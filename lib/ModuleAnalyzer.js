/**
 * ModuleAnalyzer
 * 
 * Utilities for analyzing webpack modules:
 * - List exports
 * - Analyze dependencies
 * - Search modules
 */

class ModuleAnalyzer {
    /**
     * @param {import('./WebpackBundleLoader')} loader - WebpackBundleLoader instance
     */
    constructor(loader) {
        this.loader = loader;
    }

    /**
     * Get all module IDs with basic info
     * @returns {Object[]} Array of module info objects
     */
    listModules() {
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
     * @param {string} moduleId - Module ID
     * @returns {Object} Export analysis
     */
    analyzeExports(moduleId) {
        if (!this.loader.hasModule(moduleId)) {
            return { error: `Module "${moduleId}" not found` };
        }

        try {
            const exports = this.loader.getModuleExports(moduleId);
            const result = {
                moduleId,
                type: typeof exports,
                isEsModule: exports && exports.__esModule === true,
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
                        preview: this._getValuePreview(value)
                    };
                }
            } else if (typeof exports === 'function') {
                result.exports['default'] = {
                    type: 'function',
                    isFunction: true,
                    isClass: /^class\s/.test(exports.toString()),
                    preview: exports.name || '(anonymous)'
                };
            }

            return result;
        } catch (e) {
            return { error: e.message };
        }
    }

    /**
     * Analyze dependencies of a module (modules it requires)
     * @param {string} moduleId - Module ID
     * @returns {Object} Dependency analysis
     */
    analyzeDependencies(moduleId) {
        if (!this.loader.hasModule(moduleId)) {
            return { error: `Module "${moduleId}" not found` };
        }

        const source = this.loader.getModuleSource(moduleId);
        const deps = [];

        // Match various require patterns in webpack modules
        // Pattern: e("moduleId") or n.n(e("moduleId"))
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
     * @param {string} moduleId - Module ID
     * @returns {Object} Dependents analysis
     */
    findDependents(moduleId) {
        const dependents = [];

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
     * @param {string} pattern - Search pattern (supports * wildcard)
     * @returns {Object[]} Matching modules
     */
    searchModules(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
        const matches = [];

        for (const id of this.loader.getModuleIds()) {
            if (regex.test(id)) {
                matches.push({
                    id,
                    matchType: 'id'
                });
                continue;
            }

            // Also search in source code
            const source = this.loader.getModuleSource(id);
            if (source && regex.test(source)) {
                matches.push({
                    id,
                    matchType: 'source'
                });
            }
        }

        return matches;
    }

    /**
     * Call a method on a module
     * @param {string} moduleId - Module ID
     * @param {string} methodName - Method name to call
     * @param {any[]} args - Arguments to pass
     * @returns {any} Method result
     */
    callMethod(moduleId, methodName, args = []) {
        const exports = this.loader.getModuleExports(moduleId);

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
     * @returns {Object} Summary object
     */
    getSummary() {
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

    _getValuePreview(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';

        switch (typeof value) {
            case 'function':
                return value.name || '(anonymous function)';
            case 'object':
                if (Array.isArray(value)) {
                    return `Array(${value.length})`;
                }
                return `Object{${Object.keys(value).slice(0, 3).join(', ')}${Object.keys(value).length > 3 ? '...' : ''}}`;
            case 'string':
                return value.length > 50 ? value.substring(0, 50) + '...' : value;
            default:
                return String(value);
        }
    }
}

module.exports = ModuleAnalyzer;
