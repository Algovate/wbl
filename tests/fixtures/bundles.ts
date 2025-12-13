/**
 * Test Fixtures
 * 
 * Paths to test bundles for consistent test setup.
 */

import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Real-world bundles directory (production webpack bundles)
 */
export const NHSA_DIR = path.join(__dirname, '../examples/bundles/nhsa');

/**
 * Example bundles directory (hand-crafted + compiled)
 */
export const BUNDLES_DIR = path.join(__dirname, '../examples/bundles');

/**
 * NHSA production bundles (Webpack 4)
 */
export const WEBPACK4_BUNDLES = {
    APP: path.join(NHSA_DIR, 'app.js'),
    CHUNK: path.join(NHSA_DIR, 'ServiceSearchModule.js')
};

/**
 * Hand-crafted Webpack 4 bundles
 */
export const HANDCRAFTED_BUNDLES = {
    SIMPLE_MATH: path.join(BUNDLES_DIR, 'simple-math.bundle.js'),
    STRING_UTILS: path.join(BUNDLES_DIR, 'string-utils.chunk.js')
};

/**
 * Webpack 5 bundles from sample projects
 */
export const WEBPACK5_BUNDLES = {
    UTILS_LIB: path.join(BUNDLES_DIR, 'utils-lib.bundle.js'),
    CLASS_APP: path.join(BUNDLES_DIR, 'class-app.bundle.js')
};

/**
 * All available bundles
 */
export const ALL_BUNDLES = {
    ...WEBPACK4_BUNDLES,
    ...HANDCRAFTED_BUNDLES,
    ...WEBPACK5_BUNDLES
};
