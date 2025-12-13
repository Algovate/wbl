/**
 * Inspect command - Inspect module exports
 * 
 * Options:
 *   --deep    Include source analysis (APIs, functions, categories)
 *   --verbose Show full function source code
 */

import { CommandContext } from '../types.js';

export interface InspectOptions {
    deep?: boolean;
    verbose?: boolean;
}

export function cmdInspect(
    ctx: CommandContext,
    moduleId: string,
    options: InspectOptions = {}
): void {
    const { deep = false, verbose = false } = options;
    const { out } = ctx;

    // Deep analysis (merged from analyze command)
    if (deep) {
        const analysis = ctx.analyzer.analyzeSource(moduleId);

        // JSON output
        if (out.json) {
            out.print(analysis);
            return;
        }

        out.log(`Module: ${analysis.moduleId}`);
        out.log(`Source: ${(analysis.sourceLength / 1024).toFixed(1)} KB`);
        out.log();

        if (analysis.category.length > 0) {
            out.log(`Category: ${analysis.category.join(', ')}`);
        }
        if (analysis.httpMethods.length > 0) {
            out.log(`HTTP Methods: ${analysis.httpMethods.join(', ')}`);
        }

        if (analysis.apiEndpoints.length > 0) {
            out.log(`\nAPI Endpoints (${analysis.apiEndpoints.length}):`);
            for (const endpoint of analysis.apiEndpoints) {
                out.log(`  ${endpoint}`);
            }
        }

        if (analysis.functionNames.length > 0) {
            out.log(`\nFunctions/Methods (${analysis.functionNames.length}):`);
            const sorted = analysis.functionNames.sort((a, b) => a.localeCompare(b));
            for (let i = 0; i < sorted.length; i += 4) {
                out.log(`  ${sorted.slice(i, i + 4).join(', ')}`);
            }
        }

        if (analysis.strings.length > 0) {
            out.log(`\nStrings (${analysis.strings.length}):`);
            for (const str of analysis.strings.slice(0, 10)) {
                const display = str.length > 60 ? str.substring(0, 60) + '...' : str;
                out.log(`  "${display}"`);
            }
        }

        if (analysis.dependencies.length > 0) {
            out.log(`\nDependencies (${analysis.dependencies.length}):`);
            const deps = analysis.dependencies.slice(0, 15);
            out.log(`  ${deps.join(', ')}${analysis.dependencies.length > 15 ? ', ...' : ''}`);
        }
        return;
    }

    // Standard export inspection
    const result = ctx.analyzer.analyzeExports(moduleId);

    if (result.error) {
        out.error(`Error: ${result.error}`);
        return;
    }

    // JSON output
    if (out.json) {
        out.print(result);
        return;
    }

    out.log(`Module: ${result.moduleId}`);
    out.log(`Type: ${result.type}`);
    out.log(`ES Module: ${result.isEsModule}`);
    out.log(`\nExports:`);

    for (const [name, info] of Object.entries(result.exports)) {
        const type = info.isClass ? 'class' : info.isFunction ? 'function' : info.type;
        if (info.isFunction && info.signature) {
            out.log(`\n  ${name}${info.signature}: ${type}`);
            if (verbose) {
                const exports = ctx.loader.getModuleExports(moduleId) as Record<string, unknown>;
                if (exports && typeof exports[name] === 'function') {
                    const fnSource = Function.prototype.toString.call(exports[name]);
                    out.log(`    Source:\n${fnSource.split('\n').map(l => '      ' + l).join('\n')}`);
                }
            } else if (info.bodySnippet) {
                out.log(`    Body: ${info.bodySnippet}`);
            }
        } else {
            out.log(`  ${name}: ${type} - ${info.preview}`);
        }
    }
}
