/**
 * Source command - Show module source code
 */

import { CommandContext } from '../types.js';
import { LIMITS } from '../../lib/constants.js';

export function cmdSource(ctx: CommandContext, moduleId: string, grep?: string): void {
    if (!ctx.loader.hasModule(moduleId)) {
        console.error(`Error: Module "${moduleId}" not found`);
        return;
    }

    const source = ctx.loader.getModuleSource(moduleId);
    if (!source) {
        console.error(`Error: Could not get source for module "${moduleId}"`);
        return;
    }

    console.log(`Module: ${moduleId}`);
    console.log(`Source length: ${source.length} chars\n`);

    if (grep) {
        // Filter lines containing the pattern
        const lines = source.split(/[;,]/).map(l => l.trim());
        const matches = lines.filter(l => l.toLowerCase().includes(grep.toLowerCase()));
        console.log(`Matches for "${grep}" (${matches.length}):\n`);
        for (const line of matches.slice(0, LIMITS.SEARCH_RESULTS)) {
            console.log(`  ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
        }
        if (matches.length > LIMITS.SEARCH_RESULTS) {
            console.log(`\n  ... and ${matches.length - LIMITS.SEARCH_RESULTS} more matches`);
        }
    } else {
        // Pretty print with line breaks
        const formatted = source
            .replace(/;/g, ';\n')
            .replace(/\{/g, '{\n')
            .replace(/\}/g, '\n}');
        console.log(formatted.substring(0, LIMITS.SOURCE_PREVIEW));
        if (source.length > LIMITS.SOURCE_PREVIEW) {
            console.log(`\n... (${source.length - LIMITS.SOURCE_PREVIEW} more chars, use --grep to filter)`);
        }
    }
}
