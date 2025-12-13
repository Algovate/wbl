/**
 * CLI Option Utilities
 * 
 * Shared option handling for CLI commands.
 */

import * as path from 'path';

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
