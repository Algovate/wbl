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
  list              List all modules
  inspect <id>      Inspect module exports
  deps <id>         Show module dependencies
  search <pattern>  Search modules
  call <id.method> [args...]  Call a module method
  require <id>      Require and return module
  info              Show bundle info
  exit              Exit REPL
`;

/**
 * Command registry for REPL
 */
const commands: Record<string, (ctx: CommandContext, args: string[]) => void> = {
    list: (ctx) => cmdList(ctx),
    inspect: (ctx, args) => {
        if (args[0]) cmdInspect(ctx, args[0]);
        else console.error('Usage: inspect <moduleId>');
    },
    deps: (ctx, args) => {
        if (args[0]) cmdDeps(ctx, args[0]);
        else console.error('Usage: deps <moduleId>');
    },
    search: (ctx, args) => {
        if (args[0]) cmdSearch(ctx, args[0]);
        else console.error('Usage: search <pattern>');
    },
    call: (ctx, args) => {
        if (args[0]) cmdCall(ctx, args[0], args.slice(1));
        else console.error('Usage: call <moduleId.method> [args...]');
    },
    info: (ctx) => cmdInfo(ctx),
    help: () => console.log(HELP_TEXT),
};

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

        const [cmd, ...args] = input.split(/\s+/);

        // Handle special commands
        if (cmd === 'exit' || cmd === 'quit') {
            rl.close();
            return;
        }

        if (cmd === 'require') {
            if (args[0]) {
                try {
                    const exports = ctx.loader.require(args[0]);
                    console.log(exports);
                } catch (e) {
                    console.error(`Error: ${(e as Error).message}`);
                }
            } else {
                console.error('Usage: require <moduleId>');
            }
            rl.prompt();
            return;
        }

        // Execute command from registry
        const handler = commands[cmd];
        if (handler) {
            handler(ctx, args);
        } else {
            console.error(`Unknown command: ${cmd}. Type "help" for available commands.`);
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
}
