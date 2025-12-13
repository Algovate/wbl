/**
 * Webpack 5 Bundle Parser
 */

import { BUNDLE_PATTERNS } from '../constants.js';
import { BundleLoadError } from '../errors.js';
import type { BundleParser, ParseResult, ModuleFunction, WebpackModule, WebpackRequire } from './types.js';

/**
 * Simple brace matching for module extraction
 * Doesn't handle strings to avoid issues with regex literals containing quotes
 */
function findMatchingBraceSimple(content: string, openPos: number): number {
    if (openPos < 0 || openPos >= content.length || content[openPos] !== '{') {
        return -1;
    }

    let depth = 0;
    for (let i = openPos; i < content.length; i++) {
        const char = content[i];
        if (char === '{') depth++;
        else if (char === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

/**
 * Wrap a Webpack 5 module function
 */
function wrapWebpack5Module(originalFn: ModuleFunction): ModuleFunction {
    return (module: WebpackModule, exports: Record<string, unknown>, require: WebpackRequire) => {
        originalFn(module, exports, require);
    };
}

/**
 * Parser for Webpack 5 UMD format
 */
export class Webpack5UmdParser implements BundleParser {
    canParse(content: string): boolean {
        return BUNDLE_PATTERNS.WEBPACK5_UMD.test(content) &&
            BUNDLE_PATTERNS.WEBPACK5_MODULES.test(content);
    }

    parse(content: string, bundleName: string): ParseResult {
        return parseWebpack5Modules(content, bundleName, 'webpack5-umd');
    }
}

/**
 * Parser for Webpack 5 Arrow IIFE format
 */
export class Webpack5IifeParser implements BundleParser {
    canParse(content: string): boolean {
        return BUNDLE_PATTERNS.WEBPACK5_ARROW_IIFE.test(content) &&
            BUNDLE_PATTERNS.WEBPACK5_MODULES.test(content);
    }

    parse(content: string, bundleName: string): ParseResult {
        return parseWebpack5Modules(content, bundleName, 'webpack5');
    }
}

/**
 * Common Webpack 5 module parsing logic
 */
function parseWebpack5Modules(
    content: string,
    bundleName: string,
    format: 'webpack5' | 'webpack5-umd'
): ParseResult {
    const modulesMatch = content.match(BUNDLE_PATTERNS.WEBPACK5_MODULES);
    if (!modulesMatch || modulesMatch.index === undefined) {
        throw new BundleLoadError(bundleName, 'Could not find __webpack_modules__ in Webpack 5 bundle');
    }

    const startIndex = modulesMatch.index + modulesMatch[0].length - 1;
    const endIndex = findMatchingBraceSimple(content, startIndex);

    if (endIndex === -1) {
        throw new BundleLoadError(bundleName, 'Could not find matching brace for __webpack_modules__');
    }

    const modulesObjectStr = content.substring(startIndex, endIndex + 1);

    try {
        const rawModulesRaw = eval('(' + modulesObjectStr + ')');
        
        // Validate that eval result is an object
        if (typeof rawModulesRaw !== 'object' || rawModulesRaw === null) {
            throw new BundleLoadError(bundleName, 'Parsed modules is not an object');
        }

        const rawModules = rawModulesRaw as Record<string, unknown>;
        const modules: Record<string, ModuleFunction> = {};

        for (const [moduleId, moduleFn] of Object.entries(rawModules)) {
            if (typeof moduleId !== 'string') {
                throw new BundleLoadError(bundleName, `Invalid module ID: expected string, got ${typeof moduleId}`);
            }
            if (typeof moduleFn === 'function') {
                const fnStr = moduleFn.toString();
                if (fnStr.includes('eval(')) {
                    modules[moduleId] = wrapWebpack5Module(moduleFn as ModuleFunction);
                } else {
                    modules[moduleId] = moduleFn as ModuleFunction;
                }
            } else if (moduleFn !== undefined && moduleFn !== null) {
                // Warn about non-function modules (some may be valid, but log for debugging)
                console.warn(`Module ${moduleId} in ${bundleName} is not a function (type: ${typeof moduleFn})`);
            }
        }

        return { modules, format };
    } catch (error) {
        throw new BundleLoadError(
            bundleName,
            `Failed to parse Webpack 5 modules: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

/**
 * Export all Webpack 5 parsers
 */
export const webpack5Parsers: BundleParser[] = [
    new Webpack5UmdParser(),
    new Webpack5IifeParser()
];
