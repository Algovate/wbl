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
 *   repl              Interactive REPL mode
 */

const { program } = require('commander');
const readline = require('readline');
const path = require('path');
const WebpackBundleLoader = require('../lib/WebpackBundleLoader');
const ModuleAnalyzer = require('../lib/ModuleAnalyzer');

// Shared state
let loader = null;
let analyzer = null;

/**
 * Initialize loader with bundle files
 */
function initLoader(bundles) {
    if (!bundles || bundles.length === 0) {
        console.error('Error: No bundle files specified');
        process.exit(1);
    }

    loader = new WebpackBundleLoader();

    console.log('Loading bundles:');
    for (const bundle of bundles) {
        try {
            const count = loader.loadBundle(bundle);
            const name = path.basename(bundle);
            console.log(`  ${name}: ${count} modules`);
        } catch (e) {
            console.error(`  Error loading ${bundle}: ${e.message}`);
        }
    }
    console.log(`Total: ${loader.totalModules} modules\n`);

    analyzer = new ModuleAnalyzer(loader);
    return { loader, analyzer };
}

/**
 * List all modules
 */
function cmdList() {
    const modules = analyzer.listModules();
    console.log(`Modules (${modules.length}):\n`);

    for (const mod of modules) {
        console.log(`  ${mod.id}`);
    }
}

/**
 * Inspect module exports
 */
function cmdInspect(moduleId) {
    const result = analyzer.analyzeExports(moduleId);

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
        console.log(`  ${name}: ${type} - ${info.preview}`);
    }
}

/**
 * Show module dependencies
 */
function cmdDeps(moduleId) {
    const deps = analyzer.analyzeDependencies(moduleId);

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
    const dependents = analyzer.findDependents(moduleId);
    for (const dep of dependents.dependents) {
        if (dep !== moduleId) {
            console.log(`  ${dep}`);
        }
    }
}

/**
 * Search modules
 */
function cmdSearch(pattern) {
    const matches = analyzer.searchModules(pattern);

    console.log(`Search: "${pattern}"`);
    console.log(`Matches (${matches.length}):\n`);

    for (const match of matches) {
        console.log(`  ${match.id} (${match.matchType})`);
    }
}

/**
 * Call a module method
 */
function cmdCall(methodPath, args) {
    const parts = methodPath.split('.');
    if (parts.length < 2) {
        console.error('Error: Use format moduleId.methodName');
        return;
    }

    const moduleId = parts[0];
    const methodName = parts.slice(1).join('.');

    try {
        // Parse args as JSON
        const parsedArgs = args.map(arg => {
            try {
                return JSON.parse(arg);
            } catch {
                return arg;  // Keep as string if not valid JSON
            }
        });

        const result = analyzer.callMethod(moduleId, methodName, parsedArgs);
        console.log('Result:', result);
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

/**
 * Interactive REPL mode
 */
function cmdRepl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'wbl> '
    });

    console.log('WBL REPL - Type "help" for commands, "exit" to quit\n');
    rl.prompt();

    rl.on('line', (line) => {
        const input = line.trim();
        if (!input) {
            rl.prompt();
            return;
        }

        const [cmd, ...args] = input.split(/\s+/);

        switch (cmd) {
            case 'help':
                console.log(`
Commands:
  list              List all modules
  inspect <id>      Inspect module exports
  deps <id>         Show module dependencies
  search <pattern>  Search modules
  call <id.method> [args...]  Call a module method
  require <id>      Require and return module
  info              Show bundle info
  exit              Exit REPL
`);
                break;

            case 'list':
                cmdList();
                break;

            case 'inspect':
                if (args[0]) cmdInspect(args[0]);
                else console.error('Usage: inspect <moduleId>');
                break;

            case 'deps':
                if (args[0]) cmdDeps(args[0]);
                else console.error('Usage: deps <moduleId>');
                break;

            case 'search':
                if (args[0]) cmdSearch(args[0]);
                else console.error('Usage: search <pattern>');
                break;

            case 'call':
                if (args[0]) cmdCall(args[0], args.slice(1));
                else console.error('Usage: call <moduleId.method> [args...]');
                break;

            case 'require':
                if (args[0]) {
                    try {
                        const exports = loader.require(args[0]);
                        console.log(exports);
                    } catch (e) {
                        console.error(`Error: ${e.message}`);
                    }
                } else {
                    console.error('Usage: require <moduleId>');
                }
                break;

            case 'info':
                const summary = analyzer.getSummary();
                console.log('Bundles:');
                for (const b of summary.bundles) {
                    console.log(`  ${b.name}: ${b.size}, ${b.modules} modules (${b.format})`);
                }
                console.log(`Total: ${summary.totalModules} modules`);
                break;

            case 'exit':
            case 'quit':
                rl.close();
                return;

            default:
                console.error(`Unknown command: ${cmd}. Type "help" for available commands.`);
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
}

// =============================================================================
// CLI Setup
// =============================================================================

program
    .name('wbl')
    .description('Webpack Bundle Loader - Load, analyze, and interact with webpack bundles')
    .version('1.0.0');

program
    .command('list')
    .description('List all loaded modules')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options) => {
        initLoader(options.bundles);
        cmdList();
    });

program
    .command('inspect <moduleId>')
    .description('Inspect module exports')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((moduleId, options) => {
        initLoader(options.bundles);
        cmdInspect(moduleId);
    });

program
    .command('deps <moduleId>')
    .description('Show module dependencies')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((moduleId, options) => {
        initLoader(options.bundles);
        cmdDeps(moduleId);
    });

program
    .command('search <pattern>')
    .description('Search modules by pattern')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((pattern, options) => {
        initLoader(options.bundles);
        cmdSearch(pattern);
    });

program
    .command('call <methodPath>')
    .description('Call a module method (format: moduleId.methodName)')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .argument('[args...]', 'Arguments to pass to the method')
    .action((methodPath, args, options) => {
        initLoader(options.bundles);
        cmdCall(methodPath, args);
    });

program
    .command('repl')
    .description('Interactive REPL mode')
    .argument('<bundles...>', 'Bundle files to load')
    .action((bundles) => {
        initLoader(bundles);
        cmdRepl();
    });

program
    .command('info')
    .description('Show loaded bundle information')
    .requiredOption('-b, --bundles <files...>', 'Bundle files to load')
    .action((options) => {
        initLoader(options.bundles);
        const summary = analyzer.getSummary();
        console.log('Bundles:');
        for (const b of summary.bundles) {
            console.log(`  ${b.name}: ${b.size}, ${b.modules} modules (${b.format})`);
        }
        console.log(`\nTotal: ${summary.totalModules} modules`);
    });

program.parse();
