/**
 * List command - List all modules
 */

import { CommandContext } from '../types.js';

export function cmdList(ctx: CommandContext): void {
    const modules = ctx.analyzer.listModules();
    console.log(`Modules (${modules.length}):\n`);

    for (const mod of modules) {
        console.log(`  ${mod.id}`);
    }
}
