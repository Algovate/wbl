/**
 * Constants and configuration for WBL
 */

/**
 * Bundle format detection patterns
 */
export const BUNDLE_PATTERNS = {
    /** Pattern to match main bundle format: }({ */
    MAIN: /\}\(\{/,
    /** Prefix for chunk bundle format */
    CHUNK_START: '(window.webpackJsonp',
    /** Pattern to find modules object in chunk format */
    CHUNK_MODULES: '], {'
} as const;

/**
 * Webpack require patterns for dependency detection
 */
export const REQUIRE_PATTERNS = [
    /\be\s*\(\s*["']([^"']+)["']\s*\)/g,  // e("moduleId")
    /\bt\s*\(\s*["']([^"']+)["']\s*\)/g,  // t("moduleId")
    /\bn\s*\(\s*["']([^"']+)["']\s*\)/g,  // n("moduleId")
    /__webpack_require__\s*\(\s*["']([^"']+)["']\s*\)/g,  // __webpack_require__("moduleId")
] as const;

/**
 * Default options for browser environment
 */
export const BROWSER_ENV_DEFAULTS = {
    URL: 'https://example.com/',
    REFERRER: 'https://example.com/',
    CONTENT_TYPE: 'text/html',
    STORAGE_QUOTA: 10_000_000,
    RUN_SCRIPTS: 'dangerously' as const,
    PRETEND_TO_BE_VISUAL: true
};

/**
 * CLI configuration
 */
export const CLI_CONFIG = {
    NAME: 'wbl',
    VERSION: '1.0.0',
    DESCRIPTION: 'Webpack Bundle Loader - Load, analyze, and interact with webpack bundles'
} as const;

/**
 * Preview/truncation limits
 */
export const LIMITS = {
    /** Maximum characters for source preview */
    SOURCE_PREVIEW: 3000,
    /** Maximum characters for function body snippet */
    BODY_SNIPPET: 80,
    /** Maximum characters for value preview */
    VALUE_PREVIEW: 50,
    /** Maximum search results to show */
    SEARCH_RESULTS: 20
} as const;
