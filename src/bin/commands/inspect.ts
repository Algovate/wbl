/**
 * Inspect command - Inspect module exports
 */

import { CommandContext } from '../types.js';

export function cmdInspect(ctx: CommandContext, moduleId: string, verbose = false): void {
    const result = ctx.analyzer.analyzeExports(moduleId);

    if (result.error) {
        console.error(`Error: ${result.error}`);
        return;
    }

    console.log(`Module: ${result.moduleId}`);
    console.log(`Type: ${result.type}`);
    console.log(`ES Module: ${result.isEsModule}`);
    console.log(`\nExports:`);

    for (const [name, info] of Object.entries(result.exports)) {
        const type = info.isClass ? 'class' : info.isFunction ? 'function' : info.type;
        if (info.isFunction && info.signature) {
            console.log(`\n  ${name}${info.signature}: ${type}`);
            if (verbose) {
                // Show full function source in verbose mode
                const exports = ctx.loader.getModuleExports(moduleId) as Record<string, unknown>;
                if (exports && typeof exports[name] === 'function') {
                    const fnSource = Function.prototype.toString.call(exports[name]);
                    console.log(`    Source:\n${fnSource.split('\n').map(l => '      ' + l).join('\n')}`);
                }
            } else if (info.bodySnippet) {
                console.log(`    Body: ${info.bodySnippet}`);
            }
        } else {
            console.log(`  ${name}: ${type} - ${info.preview}`);
        }
    }
}
