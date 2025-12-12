/**
 * CLI types and context
 */

import { WebpackBundleLoader } from '../lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../lib/ModuleAnalyzer.js';

/**
 * Context passed to all CLI commands
 */
export interface CommandContext {
    loader: WebpackBundleLoader;
    analyzer: ModuleAnalyzer;
}

/**
 * Command handler function signature
 */
export type CommandHandler = (ctx: CommandContext, ...args: unknown[]) => void | Promise<void>;
