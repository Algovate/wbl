/**
 * REPL command - Interactive REPL mode
 */

import * as readline from 'readline';
import { CommandContext } from '../types.js';
import { cmdList } from './list.js';
import { cmdInspect } from './inspect.js';
import { cmdDeps } from './deps.js';
import { cmdSearch } from './search.js';
import { cmdCall } from './call.js';
import { cmdInfo } from './info.js';

const HELP_TEXT = `
Commands:
  list [--category <cat>]        List modules (filter by category: crypto, api, http...)
  search <pattern> [--api]       Search modules (--api for API endpoints only)
  inspect <id> [--deep]          Inspect exports (--deep for source analysis)
  deps <id> [--graph]            Dependencies (--graph for Mermaid diagram)
  call <id.method> [args...]     Call a module method
  require <id>                   Require and return module
  info                           Show bundle info
  help                           Show this help
  exit                           Exit REPL
`;

/**
 * Parse REPL command arguments with options
 */
function parseReplArgs(args: string[]): { positional: string[]; options: Record<string, boolean | string> } {
    const positional: string[] = [];
    const options: Record<string, boolean | string> = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            // Check if next arg is a value (not another option)
            if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
                options[key] = args[i + 1];
                i++;
            } else {
                options[key] = true;
            }
        } else {
            positional.push(arg);
        }
    }

    return { positional, options };
}

export function cmdRepl(ctx: CommandContext): void {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'wbl> '
    });

    console.log('WBL REPL - Type "help" for commands, "exit" to quit\n');
    rl.prompt();

    rl.on('line', (line: string) => {
        const input = line.trim();
        if (!input) {
            rl.prompt();
            return;
        }

        const [cmd, ...rawArgs] = input.split(/\s+/);
        const { positional, options } = parseReplArgs(rawArgs);

        // Handle special commands
        if (cmd === 'exit' || cmd === 'quit') {
            rl.close();
            return;
        }

        try {
            switch (cmd) {
                case 'list':
                    cmdList(ctx, { category: options.category as string });
                    break;

                case 'search':
                    if (positional[0]) {
                        cmdSearch(ctx, positional[0], { api: !!options.api });
                    } else {
                        console.error('Usage: search <pattern> [--api]');
                    }
                    break;

                case 'inspect':
                    if (positional[0]) {
                        cmdInspect(ctx, positional[0], {
                            deep: !!options.deep,
                            verbose: !!options.verbose
                        });
                    } else {
                        console.error('Usage: inspect <moduleId> [--deep] [--verbose]');
                    }
                    break;

                case 'deps':
                    if (positional[0]) {
                        cmdDeps(ctx, positional[0], {
                            graph: !!options.graph,
                            depth: options.depth ? parseInt(options.depth as string, 10) : 2
                        });
                    } else {
                        console.error('Usage: deps <moduleId> [--graph] [--depth <n>]');
                    }
                    break;

                case 'call':
                    if (positional[0]) {
                        cmdCall(ctx, positional[0], positional.slice(1));
                    } else {
                        console.error('Usage: call <moduleId.method> [args...]');
                    }
                    break;

                case 'require':
                    if (positional[0]) {
                        const exports = ctx.loader.require(positional[0]);
                        console.log(exports);
                    } else {
                        console.error('Usage: require <moduleId>');
                    }
                    break;

                case 'info':
                    cmdInfo(ctx);
                    break;

                case 'help':
                    console.log(HELP_TEXT);
                    break;

                default:
                    console.error(`Unknown command: ${cmd}. Type "help" for available commands.`);
            }
        } catch (e) {
            console.error(`Error: ${(e as Error).message}`);
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
}
