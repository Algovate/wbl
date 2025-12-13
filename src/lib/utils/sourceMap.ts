/**
 * Source Map Resolver Utility
 * 
 * Load and parse source maps to map minified code back to original source.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SourceMapConsumer, RawSourceMap } from 'source-map';

/**
 * Result of source map position mapping
 */
export interface SourceMapResult {
    /** Original source code (if available) */
    originalSource: string | null;
    /** Original position in source */
    originalPosition: {
        line: number;
        column: number;
        name: string | null;
    } | null;
    /** Path to original source file */
    sourcePath: string | null;
}

/**
 * Options for SourceMapResolver
 */
export interface SourceMapResolverOptions {
    /** Base directory for resolving source paths */
    baseDir?: string;
}

/**
 * Resolver for source maps
 * 
 * @example
 * ```typescript
 * const resolver = new SourceMapResolver();
 * await resolver.loadFromFile('bundle.js.map');
 * 
 * // Get original source for a position
 * const result = await resolver.mapPosition(10, 15);
 * console.log(result.originalSource);
 * ```
 */
export class SourceMapResolver {
    private consumer: SourceMapConsumer | null = null;
    private rawSourceMap: RawSourceMap | null = null;
    private options: SourceMapResolverOptions;

    constructor(options?: SourceMapResolverOptions) {
        this.options = options || {};
    }

    /**
     * Load source map from a file
     */
    async loadFromFile(filePath: string): Promise<void> {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        await this.loadFromContent(content);

        // Set base dir from source map location if not specified
        if (!this.options.baseDir) {
            this.options.baseDir = path.dirname(absolutePath);
        }
    }

    /**
     * Load source map from inline content (data URL or JSON string)
     */
    async loadFromContent(content: string): Promise<void> {
        let rawMap: RawSourceMap;

        // Check if it's a data URL (inline source map)
        if (content.startsWith('data:')) {
            const base64Match = content.match(/^data:application\/json;base64,(.+)$/);
            if (base64Match) {
                const decoded = Buffer.from(base64Match[1], 'base64').toString('utf-8');
                rawMap = JSON.parse(decoded);
            } else {
                throw new Error('Invalid inline source map format');
            }
        } else {
            rawMap = JSON.parse(content);
        }

        // Destroy existing consumer if any
        if (this.consumer) {
            this.consumer.destroy();
        }

        this.rawSourceMap = rawMap;
        this.consumer = await new SourceMapConsumer(rawMap);
    }


    /**
     * Load source map from a bundle file (looks for inline or external source map)
     */
    async loadFromBundle(bundlePath: string): Promise<boolean> {
        const content = fs.readFileSync(bundlePath, 'utf-8');

        // Look for inline source map
        const inlineMatch = content.match(/\/\/# sourceMappingURL=(data:application\/json;base64,[^\s]+)/);
        if (inlineMatch) {
            await this.loadFromContent(inlineMatch[1]);
            return true;
        }

        // Look for external source map reference
        const externalMatch = content.match(/\/\/# sourceMappingURL=([^\s]+)/);
        if (externalMatch) {
            const mapPath = path.resolve(path.dirname(bundlePath), externalMatch[1]);
            if (fs.existsSync(mapPath)) {
                await this.loadFromFile(mapPath);
                return true;
            }
        }

        return false;
    }

    /**
     * Map a position in generated code to original source
     */
    async mapPosition(line: number, column: number): Promise<SourceMapResult> {
        if (!this.consumer) {
            return {
                originalSource: null,
                originalPosition: null,
                sourcePath: null,
            };
        }

        const originalPosition = this.consumer.originalPositionFor({ line, column });

        if (!originalPosition.source) {
            return {
                originalSource: null,
                originalPosition: null,
                sourcePath: null,
            };
        }

        const originalSource = this.consumer.sourceContentFor(originalPosition.source, true);

        return {
            originalSource,
            originalPosition: {
                line: originalPosition.line ?? 0,
                column: originalPosition.column ?? 0,
                name: originalPosition.name,
            },
            sourcePath: originalPosition.source,
        };
    }

    /**
     * Get all original sources in the source map
     */
    getSources(): string[] {
        if (!this.rawSourceMap) {
            return [];
        }
        return this.rawSourceMap.sources || [];
    }

    /**
     * Get original source content by source path
     */
    getSourceContent(sourcePath: string): string | null {
        if (!this.consumer) {
            return null;
        }
        return this.consumer.sourceContentFor(sourcePath, true);
    }

    /**
     * Check if resolver has loaded source map
     */
    isLoaded(): boolean {
        return this.consumer !== null;
    }

    /**
     * Clean up resources
     */
    destroy(): void {
        if (this.consumer) {
            this.consumer.destroy();
            this.consumer = null;
        }
    }
}

/**
 * Extract inline source map from bundle content
 */
export function extractInlineSourceMap(content: string): string | null {
    const match = content.match(/\/\/# sourceMappingURL=(data:application\/json;base64,[^\s]+)/);
    return match ? match[1] : null;
}

/**
 * Get source map file path from bundle
 */
export function getExternalSourceMapPath(bundleContent: string, bundlePath: string): string | null {
    const match = bundleContent.match(/\/\/# sourceMappingURL=([^\s]+)/);
    if (!match || match[1].startsWith('data:')) {
        return null;
    }
    return path.resolve(path.dirname(bundlePath), match[1]);
}

export default SourceMapResolver;
