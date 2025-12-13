#!/usr/bin/env node

/**
 * WBL - Webpack Bundle Loader CLI
 * 
 * Commands:
 *   list              List all modules
 *   search <pattern>  Search modules (--api for API endpoints)
 *   inspect <id>      Inspect module exports (--deep for source analysis)
 *   deps <id>         Show dependencies (--graph for Mermaid diagram)
 *   source <id>       Show module source code
 *   call <id.method>  Call a module method
 *   info              Show bundle information
 *   repl              Interactive REPL mode
 * 
 * Global Options:
 *   --json            Output results as JSON (for script integration)
 */

import { program } from 'commander';
import * as path from 'path';
import { WebpackBundleLoader } from '../lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../lib/ModuleAnalyzer.js';
import { CLI_CONFIG } from '../lib/constants.js';
import { CommandContext, OutputContext } from './types.js';
import {
    cmdList,
    cmdInspect,
    cmdDeps,
    cmdSearch,
    cmdSource,
    cmdCall,
    cmdInfo,
    cmdRepl
} from './commands/index.js';
import {
    BrowserEnvOptions,
    collectRegexpPatches,
    setupBrowserFromOptions
} from './utils/options.js';

// Global JSON output flag
let jsonOutput = false;

/**
 * Create output context for commands
 */
function createOutputContext(): OutputContext {
    return {
        json: jsonOutput,
        print: (data: unknown) => {
            if (jsonOutput) {
                console.log(JSON.stringify(data, null, 2));
            }
        },
        log: (...args: unknown[]) => {
            if (!jsonOutput) {
                console.log(...args);
            }
        },
        error: (...args: unknown[]) => {
            console.error(...args);
        }
    };
}

/**
 * Initialize loader with bundle files
 */
function initLoader(bundles: string[], out: OutputContext): CommandContext {
    if (!bundles || bundles.length === 0) {
        out.error('Error: No bundle files specified');
        process.exit(1);
    }

    const loader = new WebpackBundleLoader();

    out.log('Loading bundles:');
    for (const bundle of bundles) {
        try {
            const count = loader.loadBundle(bundle);
            const name = path.basename(bundle);
            out.log(`  ${name}: ${count} modules`);
        } catch (e) {
            out.error(`  Error loading ${bundle}: ${(e as Error).message}`);
        }
    }
    out.log(`Total: ${loader.totalModules} modules\n`);

    const analyzer = new ModuleAnalyzer(loader);
    return { loader, analyzer, out };
}

// =============================================================================
// CLI Setup
// =============================================================================

program
    .name(CLI_CONFIG.NAME)
    .description(CLI_CONFIG.DESCRIPTION)
    .version(CLI_CONFIG.VERSION)
    .option('--json', 'Output results as JSON (for script integration)')
    .hook('preAction', (thisCommand) => {
        jsonOutput = thisCommand.opts().json === true;
    });

// -----------------------------------------------------------------------------
// Discovery Commands
// -----------------------------------------------------------------------------

program
    .command('list')
    .description('List all loaded modules')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-c, --category <cat>', 'Filter by category (crypto, api, http, component, etc.)')
    .action((options: { bundles: string[]; category?: string }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdList(ctx, { category: options.category });
    });

program
    .command('search <pattern>')
    .description('Search modules by pattern')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('--api', 'Search in API endpoints only')
    .action((pattern: string, options: { bundles: string[]; api?: boolean }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdSearch(ctx, pattern, { api: options.api });
    });

// -----------------------------------------------------------------------------
// Analysis Commands
// -----------------------------------------------------------------------------

program
    .command('inspect <moduleId>')
    .description('Inspect module exports')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-d, --deep', 'Deep source analysis (APIs, functions, categories)')
    .option('-v, --verbose', 'Show full function source code')
    .action((moduleId: string, options: { bundles: string[]; deep?: boolean; verbose?: boolean }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdInspect(ctx, moduleId, { deep: options.deep, verbose: options.verbose });
    });

program
    .command('deps <moduleId>')
    .description('Show module dependencies')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-g, --graph', 'Output Mermaid dependency diagram')
    .option('--depth <n>', 'Max depth for graph traversal', '2')
    .action((moduleId: string, options: { bundles: string[]; graph?: boolean; depth?: string }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdDeps(ctx, moduleId, { graph: options.graph, depth: parseInt(options.depth || '2', 10) });
    });

program
    .command('source <moduleId>')
    .description('Show module source code (without executing)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-g, --grep <pattern>', 'Filter source by pattern')
    .action((moduleId: string, options: { bundles: string[]; grep?: string }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdSource(ctx, moduleId, options.grep);
    });

// -----------------------------------------------------------------------------
// Execution Commands
// -----------------------------------------------------------------------------

program
    .command('call <methodPath>')
    .description('Call a module method (format: moduleId.methodName)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .argument('[args...]', 'Arguments to pass to the method')
    .action((methodPath: string, args: string[], options: { bundles: string[] }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdCall(ctx, methodPath, args);
    });

program
    .command('repl')
    .description('Interactive REPL mode')
    .argument('<bundles...>', 'Bundle files to load')
    .option('--browser [url]', 'Enable browser environment simulation')
    .option('--referrer <url>', 'Set referrer URL for browser environment')
    .option('--regexp-patch <from:to>', 'Fix malformed regex', collectRegexpPatches, [])
    .action((bundles: string[], options: BrowserEnvOptions) => {
        setupBrowserFromOptions(options);
        const out = createOutputContext();
        const ctx = initLoader(bundles, out);
        cmdRepl(ctx);
    });

// -----------------------------------------------------------------------------
// Info Commands
// -----------------------------------------------------------------------------

program
    .command('info')
    .description('Show loaded bundle information (format, size, modules)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options: { bundles: string[] }) => {
        const out = createOutputContext();
        const ctx = initLoader(options.bundles, out);
        cmdInfo(ctx);
    });

program.parse();
