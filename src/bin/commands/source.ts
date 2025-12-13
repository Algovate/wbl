/**
 * Source command - Show module source code
 * 
 * Supports:
 * - Basic source display with simple formatting
 * - Grep filtering for specific patterns
 * - Source map resolution (--sourcemap)
 */

import { CommandContext } from '../types.js';
import { LIMITS } from '../../lib/constants.js';
import { SourceMapResolver } from '../../lib/utils/sourceMap.js';

/**
 * Options for source command
 */
export interface SourceOptions {
    /** Pattern to filter source lines */
    grep?: string;
    /** Path to source map file */
    sourcemap?: string;
}

/**
 * Display module source code with optional filtering and source map resolution
 */
export async function cmdSource(
    ctx: CommandContext,
    moduleId: string,
    options: SourceOptions = {}
): Promise<void> {
    const { grep, sourcemap } = options;

    if (!ctx.loader.hasModule(moduleId)) {
        ctx.out.error(`Error: Module "${moduleId}" not found`);
        return;
    }

    let source = ctx.loader.getModuleSource(moduleId);
    if (!source) {
        ctx.out.error(`Error: Could not get source for module "${moduleId}"`);
        return;
    }

    // Try to resolve source map if provided
    if (sourcemap) {
        const resolver = new SourceMapResolver();
        try {
            await resolver.loadFromFile(sourcemap);
            const sources = resolver.getSources();

            if (sources.length > 0) {
                ctx.out.log(`Source map loaded: ${sources.length} source files found`);
                ctx.out.log('Sources:', sources.join(', '));

                // Try to get original source for the first file
                const originalSource = resolver.getSourceContent(sources[0]);
                if (originalSource) {
                    ctx.out.log(`\n--- Original Source (${sources[0]}) ---\n`);
                    source = originalSource;
                }
            }
            resolver.destroy();
        } catch (err) {
            ctx.out.error(`Warning: Could not load source map: ${(err as Error).message}`);
        }
    }

    ctx.out.log(`Module: ${moduleId}`);
    ctx.out.log(`Source length: ${source.length} chars\n`);

    if (grep) {
        // Filter lines containing the pattern
        const lines = source.split(/[\n;,]/).map(l => l.trim()).filter(l => l.length > 0);
        const matches = lines.filter(l => l.toLowerCase().includes(grep.toLowerCase()));
        ctx.out.log(`Matches for "${grep}" (${matches.length}):\n`);

        for (const line of matches.slice(0, LIMITS.SEARCH_RESULTS)) {
            ctx.out.log(`  ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
        }
        if (matches.length > LIMITS.SEARCH_RESULTS) {
            ctx.out.log(`\n  ... and ${matches.length - LIMITS.SEARCH_RESULTS} more matches`);
        }

        // JSON output
        if (ctx.out.json) {
            ctx.out.print({
                moduleId,
                pattern: grep,
                matchCount: matches.length,
                matches: matches.slice(0, LIMITS.SEARCH_RESULTS),
            });
        }
    } else {
        // Display source with basic formatting
        const displaySource = source
            .replace(/;/g, ';\n')
            .replace(/\{/g, '{\n')
            .replace(/\}/g, '\n}');

        ctx.out.log(displaySource.substring(0, LIMITS.SOURCE_PREVIEW));
        if (displaySource.length > LIMITS.SOURCE_PREVIEW) {
            ctx.out.log(`\n... (${displaySource.length - LIMITS.SOURCE_PREVIEW} more chars, use --grep to filter)`);
        }

        // JSON output
        if (ctx.out.json) {
            ctx.out.print({
                moduleId,
                sourceLength: source.length,
                source: source.substring(0, LIMITS.SOURCE_PREVIEW),
                truncated: source.length > LIMITS.SOURCE_PREVIEW,
            });
        }
    }
}
