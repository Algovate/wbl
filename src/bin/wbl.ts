#!/usr/bin/env node

/**
 * WBL - Webpack Bundle Loader CLI
 * 
 * Commands:
 *   list              List all modules
 *   inspect <id>      Inspect module exports
 *   deps <id>         Show module dependencies
 *   search <pattern>  Search modules
 *   call <id.method>  Call a module method
 *   format            Show bundle format information
 *   repl              Interactive REPL mode
 */

import { program } from 'commander';
import * as path from 'path';
import { WebpackBundleLoader } from '../lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../lib/ModuleAnalyzer.js';
import { CLI_CONFIG } from '../lib/constants.js';
import { CommandContext } from './types.js';
import {
    cmdList,
    cmdInspect,
    cmdDeps,
    cmdSearch,
    cmdSource,
    cmdCall,
    cmdInfo,
    cmdRepl,
    cmdFormat
} from './commands/index.js';

/**
 * Initialize loader with bundle files
 */
function initLoader(bundles: string[]): CommandContext {
    if (!bundles || bundles.length === 0) {
        console.error('Error: No bundle files specified');
        process.exit(1);
    }

    const loader = new WebpackBundleLoader();

    console.log('Loading bundles:');
    for (const bundle of bundles) {
        try {
            const count = loader.loadBundle(bundle);
            const name = path.basename(bundle);
            console.log(`  ${name}: ${count} modules`);
        } catch (e) {
            console.error(`  Error loading ${bundle}: ${(e as Error).message}`);
        }
    }
    console.log(`Total: ${loader.totalModules} modules\n`);

    const analyzer = new ModuleAnalyzer(loader);
    return { loader, analyzer };
}

// =============================================================================
// CLI Setup
// =============================================================================

program
    .name(CLI_CONFIG.NAME)
    .description(CLI_CONFIG.DESCRIPTION)
    .version(CLI_CONFIG.VERSION);

program
    .command('list')
    .description('List all loaded modules')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdList(ctx);
    });

program
    .command('inspect <moduleId>')
    .description('Inspect module exports')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-v, --verbose', 'Show full function source code')
    .action((moduleId: string, options: { bundles: string[]; verbose?: boolean }) => {
        const ctx = initLoader(options.bundles);
        cmdInspect(ctx, moduleId, options.verbose ?? false);
    });

program
    .command('deps <moduleId>')
    .description('Show module dependencies')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((moduleId: string, options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdDeps(ctx, moduleId);
    });

program
    .command('search <pattern>')
    .description('Search modules by pattern')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((pattern: string, options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdSearch(ctx, pattern);
    });

program
    .command('source <moduleId>')
    .description('Show module source code (without executing)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .option('-g, --grep <pattern>', 'Filter source by pattern')
    .action((moduleId: string, options: { bundles: string[]; grep?: string }) => {
        const ctx = initLoader(options.bundles);
        cmdSource(ctx, moduleId, options.grep);
    });

program
    .command('call <methodPath>')
    .description('Call a module method (format: moduleId.methodName)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .argument('[args...]', 'Arguments to pass to the method')
    .action((methodPath: string, args: string[], options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdCall(ctx, methodPath, args);
    });

program
    .command('repl')
    .description('Interactive REPL mode')
    .argument('<bundles...>', 'Bundle files to load')
    .action((bundles: string[]) => {
        const ctx = initLoader(bundles);
        cmdRepl(ctx);
    });

program
    .command('info')
    .description('Show loaded bundle information')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdInfo(ctx);
    });

program
    .command('format')
    .description('Analyze and show bundle format information (Webpack 4/5 detection)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options: { bundles: string[] }) => {
        const ctx = initLoader(options.bundles);
        cmdFormat(ctx);
    });

program.parse();
