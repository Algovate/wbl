/**
 * Test Utilities
 * 
 * Shared utilities for test setup and teardown.
 */

import { WebpackBundleLoader } from '../../src/lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../../src/lib/ModuleAnalyzer.js';

/**
 * Create a fresh loader instance
 */
export function createLoader(): WebpackBundleLoader {
    return new WebpackBundleLoader();
}

/**
 * Create a loader with bundles pre-loaded
 */
export function createLoaderWithBundles(bundlePaths: string[]): WebpackBundleLoader {
    const loader = new WebpackBundleLoader();
    for (const bundlePath of bundlePaths) {
        loader.loadBundle(bundlePath);
    }
    return loader;
}

/**
 * Create an analyzer with bundles pre-loaded
 */
export function createAnalyzerWithBundles(bundlePaths: string[]): ModuleAnalyzer {
    const loader = createLoaderWithBundles(bundlePaths);
    return new ModuleAnalyzer(loader);
}
