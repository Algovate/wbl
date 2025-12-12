/**
 * Call command - Call a module method
 */

import { CommandContext } from '../types.js';

export function cmdCall(ctx: CommandContext, methodPath: string, args: string[]): void {
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

        const result = ctx.analyzer.callMethod(moduleId, methodName, parsedArgs);
        console.log('Result:', result);
    } catch (e) {
        console.error(`Error: ${(e as Error).message}`);
    }
}
