/**
 * Search command - Search modules by pattern
 */

import { CommandContext } from '../types.js';

export function cmdSearch(ctx: CommandContext, pattern: string): void {
    const matches = ctx.analyzer.searchModules(pattern);

    console.log(`Search: "${pattern}"`);
    console.log(`Matches (${matches.length}):\n`);

    for (const match of matches) {
        console.log(`  ${match.id} (${match.matchType})`);
    }
}
