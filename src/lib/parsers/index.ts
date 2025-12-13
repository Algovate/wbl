/**
 * Bundle Parsers
 * 
 * Factory and exports for all bundle parsers.
 */

export * from './types.js';
export { webpack4Parsers, Webpack4MainParser, Webpack4ChunkParser } from './webpack4.js';
export { webpack5Parsers, Webpack5UmdParser, Webpack5IifeParser } from './webpack5.js';

import type { BundleParser, ParseResult } from './types.js';
import { webpack4Parsers } from './webpack4.js';
import { webpack5Parsers } from './webpack5.js';
import { UnknownBundleFormatError } from '../errors.js';

/**
 * All available parsers in priority order
 * (Webpack 5 first to match more specific patterns)
 */
export const allParsers: BundleParser[] = [
    ...webpack5Parsers,
    ...webpack4Parsers
];

/**
 * Parse bundle content using the appropriate parser
 */
export function parseBundle(content: string, bundleName: string): ParseResult {
    for (const parser of allParsers) {
        if (parser.canParse(content)) {
            return parser.parse(content, bundleName);
        }
    }
    throw new UnknownBundleFormatError(bundleName);
}

/**
 * Detect bundle format without parsing
 */
export function detectBundleFormat(content: string): string {
    for (const parser of allParsers) {
        if (parser.canParse(content)) {
            // Get format name from parser class name
            const name = parser.constructor.name;
            if (name.includes('Webpack5Umd')) return 'webpack5-umd';
            if (name.includes('Webpack5Iife')) return 'webpack5';
            if (name.includes('Webpack4Chunk')) return 'chunk';
            if (name.includes('Webpack4Main')) return 'main';
        }
    }
    return 'unknown';
}
