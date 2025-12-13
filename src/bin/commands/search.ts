/**
 * Search command - Search modules by pattern
 * 
 * Options:
 *   --api   Search in API endpoints only (merged from find-api)
 */

import { CommandContext } from '../types.js';

export interface SearchOptions {
    api?: boolean;
}

export function cmdSearch(ctx: CommandContext, pattern: string, options: SearchOptions = {}): void {
    const { api = false } = options;
    const { out } = ctx;

    // API endpoint search mode (merged from find-api)
    if (api) {
        const regex = new RegExp(pattern, 'i');
        const results: { id: string; endpoints: string[] }[] = [];

        for (const id of ctx.loader.getModuleIds()) {
            const analysis = ctx.analyzer.analyzeSource(id);
            const matchingEndpoints = analysis.apiEndpoints.filter(ep => regex.test(ep));

            if (matchingEndpoints.length > 0) {
                results.push({ id, endpoints: matchingEndpoints });
            }
        }

        // JSON output
        if (out.json) {
            out.print({ pattern, type: 'api', count: results.length, results });
            return;
        }

        if (results.length === 0) {
            out.log(`No modules found with API endpoints matching: ${pattern}`);
            return;
        }

        out.log(`API Search: "${pattern}"`);
        out.log(`Found ${results.length} modules:\n`);

        for (const result of results) {
            out.log(`  ${result.id}:`);
            for (const endpoint of result.endpoints) {
                out.log(`    ${endpoint}`);
            }
        }
        return;
    }

    // Standard source search
    const matches = ctx.analyzer.searchModules(pattern);

    // JSON output
    if (out.json) {
        out.print({ pattern, type: 'source', count: matches.length, matches });
        return;
    }

    out.log(`Search: "${pattern}"`);
    out.log(`Matches (${matches.length}):\n`);

    for (const match of matches) {
        out.log(`  ${match.id} (${match.matchType})`);
    }
}
