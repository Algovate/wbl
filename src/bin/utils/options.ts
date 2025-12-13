/**
 * CLI Option Utilities
 * 
 * Shared option handling for CLI commands.
 */

import * as path from 'path';
import { setupBrowserEnv } from '../../lib/BrowserEnv.js';

/**
 * Browser environment CLI options
 */
export interface BrowserEnvOptions {
    browser?: boolean | string;
    referrer?: string;
    regexpPatch?: string[];
}

/**
 * Resolve bundle paths to absolute paths
 */
export function resolveBundlePaths(bundles: string[]): string[] {
    return bundles.map(b => path.resolve(b));
}

/**
 * Validate that bundles option is provided
 */
export function validateBundles(bundles: string[]): void {
    if (!bundles || bundles.length === 0) {
        console.error('Error: No bundle files specified. Use -b to specify bundles.');
        process.exit(1);
    }
}

/**
 * Parse JSON arguments from CLI
 */
export function parseArgs(args: string[]): unknown[] {
    return args.map(arg => {
        try {
            return JSON.parse(arg);
        } catch {
            return arg;
        }
    });
}

/**
 * Collector function for --regexp-patch option
 */
export function collectRegexpPatches(val: string, prev: string[]): string[] {
    prev = prev || [];
    prev.push(val);
    return prev;
}

/**
 * Setup browser environment from CLI options
 * @returns true if browser environment was enabled
 */
export function setupBrowserFromOptions(options: BrowserEnvOptions): boolean {
    if (!options.browser && !options.regexpPatch?.length) {
        return false;
    }

    const url = typeof options.browser === 'string'
        ? options.browser
        : 'https://example.com/';

    // Parse regexp patches from "pattern:replacement" format
    const regexpPatches: Record<string, string> = {};
    for (const patch of options.regexpPatch || []) {
        const colonIdx = patch.indexOf(':');
        if (colonIdx > 0) {
            regexpPatches[patch.substring(0, colonIdx)] = patch.substring(colonIdx + 1);
        }
    }

    console.log(`Browser environment enabled: ${url}`);
    if (Object.keys(regexpPatches).length > 0) {
        console.log(`Regexp patches: ${Object.keys(regexpPatches).length}`);
    }
    console.log();

    setupBrowserEnv({
        url,
        referrer: options.referrer,
        regexpPatches: Object.keys(regexpPatches).length > 0 ? regexpPatches : undefined
    });

    return true;
}
