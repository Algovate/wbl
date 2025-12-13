/**
 * List command - List all modules
 * 
 * Options:
 *   --category <cat>  Filter by category (crypto, api, http, component, etc.)
 */

import { CommandContext } from '../types.js';

export interface ListOptions {
    category?: string;
}

export function cmdList(ctx: CommandContext, options: ListOptions = {}): void {
    const { category } = options;
    const { out } = ctx;
    const modules = ctx.analyzer.listModules();

    let filtered = modules;

    // Filter by category if specified
    if (category) {
        const cat = category.toLowerCase();
        filtered = modules.filter(mod => {
            const analysis = ctx.analyzer.analyzeSource(mod.id);
            return analysis.category.some(c => c.toLowerCase().includes(cat));
        });
    }

    // JSON output
    if (out.json) {
        const result = filtered.map(mod => {
            if (category) {
                const analysis = ctx.analyzer.analyzeSource(mod.id);
                return { id: mod.id, category: analysis.category };
            }
            return { id: mod.id };
        });
        out.print({ total: modules.length, filtered: filtered.length, modules: result });
        return;
    }

    // Text output
    if (category) {
        out.log(`Modules matching category "${category}" (${filtered.length}/${modules.length}):\n`);
    } else {
        out.log(`Modules (${modules.length}):\n`);
    }

    for (const mod of filtered) {
        if (category) {
            const analysis = ctx.analyzer.analyzeSource(mod.id);
            out.log(`  ${mod.id} [${analysis.category.join(', ')}]`);
        } else {
            out.log(`  ${mod.id}`);
        }
    }
}
