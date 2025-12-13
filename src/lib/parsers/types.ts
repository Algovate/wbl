/**
 * Parser Types
 * 
 * Common types for Webpack bundle parsers.
 */

/**
 * Result of parsing a bundle
 */
export interface ParseResult {
    modules: Record<string, ModuleFunction>;
    format: BundleFormat;
}

/**
 * Bundle format type
 */
export type BundleFormat = 'main' | 'chunk' | 'webpack5' | 'webpack5-umd' | 'unknown';

/**
 * Webpack module function signature
 */
export type ModuleFunction = (
    module: WebpackModule,
    exports: Record<string, unknown>,
    require: WebpackRequire
) => void;

/**
 * Webpack module object
 */
export interface WebpackModule {
    i: string;
    l: boolean;
    exports: Record<string, unknown>;
}

/**
 * Webpack require function interface
 */
export interface WebpackRequire {
    (moduleId: string): unknown;
    r: (exports: Record<string, unknown>) => void;
    d: (exports: Record<string, unknown>, nameOrDefinition: string | Record<string, () => unknown>, getter?: () => unknown) => void;
    o: (obj: object, prop: string) => boolean;
    n: (module: unknown) => () => unknown;
    m: Record<string, ModuleFunction>;
    c: Record<string, WebpackModule>;
    p: string;
}

/**
 * Bundle parser interface
 */
export interface BundleParser {
    /**
     * Check if this parser can handle the bundle content
     */
    canParse(content: string): boolean;

    /**
     * Parse the bundle and extract modules
     */
    parse(content: string, bundleName: string): ParseResult;
}
