/**
 * Deps command - Show module dependencies
 */

import { CommandContext } from '../types.js';

export function cmdDeps(ctx: CommandContext, moduleId: string): void {
    const deps = ctx.analyzer.analyzeDependencies(moduleId);

    if (deps.error) {
        console.error(`Error: ${deps.error}`);
        return;
    }

    console.log(`Module: ${deps.moduleId}`);
    console.log(`Dependencies (${deps.count}):\n`);

    for (const dep of deps.dependencies) {
        console.log(`  ${dep}`);
    }

    console.log('\nDependents:');
    const dependents = ctx.analyzer.findDependents(moduleId);
    for (const dep of dependents.dependents) {
        if (dep !== moduleId) {
            console.log(`  ${dep}`);
        }
    }
}
