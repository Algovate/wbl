/**
 * Constants and configuration for WBL
 */

// =============================================================================
// Bundle Detection Patterns
// =============================================================================

/**
 * Webpack 4 bundle detection patterns
 */
export const WEBPACK4_PATTERNS = {
    /** Pattern for main bundle format: }({ */
    MAIN: /\}\(\{/,
    /** Prefix for chunk bundle (webpackJsonp) */
    CHUNK_START: '(window.webpackJsonp',
    /** Pattern to find modules object in chunk: ], { */
    CHUNK_MODULES: '], {'
} as const;

/**
 * Webpack 5 bundle detection patterns
 */
export const WEBPACK5_PATTERNS = {
    /** Pattern for arrow IIFE with webpack comment */
    ARROW_IIFE: /\(\(\)\s*=>\s*\{\s*\/\*\*\*\*\*\*\//,
    /** Pattern for modules object: var __webpack_modules__ = ({ */
    MODULES: /var\s+__webpack_modules__\s*=\s*\(\{/,
    /** Pattern for UMD wrapper */
    UMD: /function\s+webpackUniversalModuleDefinition/,
    /** Pattern for self chunk (webpackChunk) */
    CHUNK: /self\s*\[\s*["']webpackChunk/
} as const;

/**
 * Combined bundle patterns (backwards compatibility)
 */
export const BUNDLE_PATTERNS = {
    // Webpack 4
    MAIN: WEBPACK4_PATTERNS.MAIN,
    CHUNK_START: WEBPACK4_PATTERNS.CHUNK_START,
    CHUNK_MODULES: WEBPACK4_PATTERNS.CHUNK_MODULES,
    // Webpack 5
    WEBPACK5_ARROW_IIFE: WEBPACK5_PATTERNS.ARROW_IIFE,
    WEBPACK5_MODULES: WEBPACK5_PATTERNS.MODULES,
    WEBPACK5_UMD: WEBPACK5_PATTERNS.UMD,
    WEBPACK5_CHUNK: WEBPACK5_PATTERNS.CHUNK
} as const;

// =============================================================================
// Dependency Detection
// =============================================================================

/**
 * Webpack require patterns for dependency detection
 */
export const REQUIRE_PATTERNS = [
    /\be\s*\(\s*["']([^"']+)["']\s*\)/g,  // e("moduleId")
    /\bt\s*\(\s*["']([^"']+)["']\s*\)/g,  // t("moduleId")
    /\bn\s*\(\s*["']([^"']+)["']\s*\)/g,  // n("moduleId")
    /__webpack_require__\s*\(\s*["']([^"']+)["']\s*\)/g,  // __webpack_require__("moduleId")
] as const;

// =============================================================================
// Browser Environment
// =============================================================================

/**
 * Default options for browser environment (jsdom)
 */
export const BROWSER_ENV_DEFAULTS = {
    URL: 'https://example.com/',
    REFERRER: 'https://example.com/',
    CONTENT_TYPE: 'text/html',
    STORAGE_QUOTA: 10_000_000,
    RUN_SCRIPTS: 'dangerously' as const,
    PRETEND_TO_BE_VISUAL: true
} as const;

// =============================================================================
// CLI Configuration
// =============================================================================

/**
 * CLI application configuration
 */
export const CLI_CONFIG = {
    NAME: 'wbl',
    VERSION: '1.0.0',
    DESCRIPTION: 'Webpack Bundle Loader - Load, analyze, and interact with webpack bundles'
} as const;

// =============================================================================
// Display Limits
// =============================================================================

/**
 * Preview/truncation limits for display
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
