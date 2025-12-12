/**
 * Info command - Show bundle information
 */

import { CommandContext } from '../types.js';

export function cmdInfo(ctx: CommandContext): void {
    const summary = ctx.analyzer.getSummary();
    console.log('Bundles:');
    for (const b of summary.bundles) {
        console.log(`  ${b.name}: ${b.size}, ${b.modules} modules (${b.format})`);
    }
    console.log(`\nTotal: ${summary.totalModules} modules`);
}
