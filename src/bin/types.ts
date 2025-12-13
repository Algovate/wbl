/**
 * CLI types and context
 */

import { WebpackBundleLoader } from '../lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../lib/ModuleAnalyzer.js';

/**
 * Output context for controlling output format (text vs JSON)
 */
export interface OutputContext {
    /** Whether to output JSON */
    json: boolean;
    /** Print structured data (JSON mode) */
    print: (data: unknown) => void;
    /** Log text (suppressed in JSON mode) */
    log: (...args: unknown[]) => void;
    /** Log errors (always shown) */
    error: (...args: unknown[]) => void;
}

/**
 * Default output context (text mode)
 */
export const defaultOutput: OutputContext = {
    json: false,
    print: () => { },
    log: console.log,
    error: console.error
};

/**
 * Context passed to all CLI commands
 */
export interface CommandContext {
    loader: WebpackBundleLoader;
    analyzer: ModuleAnalyzer;
    out: OutputContext;
}

/**
 * Command handler function signature
 */
export type CommandHandler = (ctx: CommandContext, ...args: unknown[]) => void | Promise<void>;
