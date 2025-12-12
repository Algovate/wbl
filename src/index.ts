/**
 * WBL - Webpack Bundle Loader
 * 
 * A library for loading, analyzing, and interacting with webpack bundles.
 * 
 * @example
 * ```typescript
 * import { WebpackBundleLoader, ModuleAnalyzer, setupBrowserEnv } from 'wbl';
 * 
 * // Optional: Setup browser environment for bundles that need DOM/window
 * const { dom, cleanup } = setupBrowserEnv({ url: 'https://example.com/' });
 * 
 * // Load bundles
 * const loader = new WebpackBundleLoader();
 * loader.loadBundle('path/to/bundle.js');
 * 
 * // Analyze modules
 * const analyzer = new ModuleAnalyzer(loader);
 * const modules = analyzer.listModules();
 * 
 * // Cleanup when done
 * cleanup();
 * ```
 * 
 * @packageDocumentation
 */

// Core classes
export { WebpackBundleLoader, BundleInfo, LoadResult } from './lib/WebpackBundleLoader.js';
export { ModuleAnalyzer, ModuleInfo, ExportAnalysis, DependencyAnalysis, SearchMatch, BundleSummary } from './lib/ModuleAnalyzer.js';
export { setupBrowserEnv, BrowserEnvOptions, BrowserEnvResult } from './lib/BrowserEnv.js';

// Error classes
export { BundleLoadError, ModuleNotFoundError, ModuleExecutionError, UnknownBundleFormatError } from './lib/errors.js';

// Constants
export { BUNDLE_PATTERNS, REQUIRE_PATTERNS, BROWSER_ENV_DEFAULTS, CLI_CONFIG, LIMITS } from './lib/constants.js';

// Utilities
export { findMatchingBrace, formatSize, truncate, getValuePreview, formatSource } from './lib/utils/index.js';

