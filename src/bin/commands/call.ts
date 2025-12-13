/**
 * Call command - Call a module method
 */

import { CommandContext } from '../types.js';

export function cmdCall(ctx: CommandContext, methodPath: string, args: string[]): void {
    const lastDot = methodPath.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === methodPath.length - 1) {
        console.error('Error: Use format moduleId.methodName');
        return;
    }

    const moduleId = methodPath.slice(0, lastDot);
    const methodName = methodPath.slice(lastDot + 1);

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
