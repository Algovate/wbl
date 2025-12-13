/**
 * Webpack 4 Bundle Parser
 */

import { BUNDLE_PATTERNS } from '../constants.js';
import { BundleLoadError } from '../errors.js';
import type { BundleParser, ParseResult, ModuleFunction } from './types.js';

/**
 * Validate that the result from eval() is a valid modules object
 */
function validateModulesObject(
    modules: unknown,
    bundleName: string
): asserts modules is Record<string, ModuleFunction> {
    if (typeof modules !== 'object' || modules === null) {
        throw new BundleLoadError(bundleName, 'Parsed modules is not an object');
    }

    const modulesObj = modules as Record<string, unknown>;
    for (const [moduleId, moduleFn] of Object.entries(modulesObj)) {
        if (typeof moduleId !== 'string') {
            throw new BundleLoadError(bundleName, `Invalid module ID: expected string, got ${typeof moduleId}`);
        }
        if (typeof moduleFn !== 'function') {
            throw new BundleLoadError(bundleName, `Module ${moduleId} is not a function`);
        }
    }
}

/**
 * Parser for Webpack 4 main bundle format
 */
export class Webpack4MainParser implements BundleParser {
    canParse(content: string): boolean {
        return BUNDLE_PATTERNS.MAIN.test(content) &&
            !content.startsWith(BUNDLE_PATTERNS.CHUNK_START) &&
            !BUNDLE_PATTERNS.WEBPACK5_MODULES.test(content);
    }

    parse(content: string, bundleName: string): ParseResult {
        const match = content.match(BUNDLE_PATTERNS.MAIN);
        if (!match || match.index === undefined) {
            throw new BundleLoadError(bundleName, 'Could not find modules object in main bundle');
        }

        // Skip "}(" to get just the modules object
        const modulesStr = content.substring(match.index + 2).replace(/\);\s*$/, '');

        try {
            const modulesRaw = eval('(' + modulesStr + ')');
            validateModulesObject(modulesRaw, bundleName);
            const modules = modulesRaw as Record<string, ModuleFunction>;
            return { modules, format: 'main' };
        } catch (error) {
            throw new BundleLoadError(
                bundleName,
                `Failed to parse modules object: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

/**
 * Parser for Webpack 4 chunk bundle format (webpackJsonp)
 */
export class Webpack4ChunkParser implements BundleParser {
    canParse(content: string): boolean {
        return content.startsWith(BUNDLE_PATTERNS.CHUNK_START);
    }

    parse(content: string, bundleName: string): ParseResult {
        const start = content.indexOf(BUNDLE_PATTERNS.CHUNK_MODULES);
        if (start === -1) {
            throw new BundleLoadError(bundleName, 'Could not find modules in chunk bundle');
        }

        // Original logic: substring from "], {" + 3, then strip trailing }]);
        const modulesStr = content.substring(start + 3).replace(/\}\s*\]\s*\)\s*;?\s*$/, '}');

        try {
            const modulesRaw = eval('(' + modulesStr + ')');
            validateModulesObject(modulesRaw, bundleName);
            const modules = modulesRaw as Record<string, ModuleFunction>;
            return { modules, format: 'chunk' };
        } catch (error) {
            throw new BundleLoadError(
                bundleName,
                `Failed to parse chunk modules: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

/**
 * Export all Webpack 4 parsers
 */
export const webpack4Parsers: BundleParser[] = [
    new Webpack4ChunkParser(),
    new Webpack4MainParser()
];
