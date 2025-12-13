/**
 * Deps command - Show module dependencies
 * 
 * Options:
 *   --graph   Output Mermaid dependency diagram
 *   --depth   Max depth for graph traversal (default: 2)
 */

import { CommandContext } from '../types.js';

export interface DepsOptions {
    graph?: boolean;
    depth?: number;
}

export function cmdDeps(ctx: CommandContext, moduleId: string, options: DepsOptions = {}): void {
    const { graph = false, depth = 2 } = options;
    const { out } = ctx;

    if (!ctx.loader.hasModule(moduleId)) {
        out.error(`Module "${moduleId}" not found`);
        return;
    }

    // Graph mode (merged from deps-graph command)
    if (graph) {
        const visited = new Set<string>();
        const edges: { from: string; to: string }[] = [];

        function collectDeps(id: string, currentDepth: number): void {
            if (visited.has(id) || currentDepth > depth) return;
            visited.add(id);

            const deps = ctx.analyzer.analyzeDependencies(id);
            for (const depId of deps.dependencies) {
                if (ctx.loader.hasModule(depId)) {
                    edges.push({ from: id, to: depId });
                    if (currentDepth < depth) {
                        collectDeps(depId, currentDepth + 1);
                    }
                }
            }
        }

        collectDeps(moduleId, 0);

        // JSON output for graph
        if (out.json) {
            const nodes = [...visited].map(id => {
                const analysis = ctx.analyzer.analyzeSource(id);
                return { id, category: analysis.category };
            });
            out.print({ moduleId, depth, nodes, edges });
            return;
        }

        out.log('```mermaid');
        out.log('graph TD');

        for (const id of visited) {
            const analysis = ctx.analyzer.analyzeSource(id);
            const categories = analysis.category;
            if (categories.length > 0) {
                out.log(`    ${id}["${id}<br/><small>${categories.join(', ')}</small>"]`);
            }
        }

        for (const edge of edges) {
            out.log(`    ${edge.from} --> ${edge.to}`);
        }

        out.log('```');
        out.log();
        out.log(`Nodes: ${visited.size}, Edges: ${edges.length}`);
        return;
    }

    // Standard deps view
    const deps = ctx.analyzer.analyzeDependencies(moduleId);
    const dependents = ctx.analyzer.findDependents(moduleId);

    if (deps.error) {
        out.error(`Error: ${deps.error}`);
        return;
    }

    // JSON output
    if (out.json) {
        out.print({
            moduleId: deps.moduleId,
            dependencies: deps.dependencies,
            dependents: dependents.dependents.filter(d => d !== moduleId)
        });
        return;
    }

    out.log(`Module: ${deps.moduleId}`);
    out.log(`Dependencies (${deps.count}):\n`);

    for (const dep of deps.dependencies) {
        out.log(`  ${dep}`);
    }

    out.log('\nDependents:');
    for (const dep of dependents.dependents) {
        if (dep !== moduleId) {
            out.log(`  ${dep}`);
        }
    }
}
