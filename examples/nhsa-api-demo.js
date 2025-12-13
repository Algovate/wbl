/**
 * NHSA API Test - High Level
 *
 * Uses the actual queryServiceFacilities method from bundles
 * by injecting browser dependencies
 */

import { WebpackBundleLoader, setupBrowserEnv } from '../dist/index.js';

// Setup browser environment with NHSA configuration
// The regexpPatches option handles malformed regex patterns in NHSA bundle code
// (e.g., RegExp("['鈥橾", "g") which is invalid due to encoding issues)
setupBrowserEnv({
    url: 'https://fuwu.nhsa.gov.cn/nationalHallSt/',
    referrer: 'https://fuwu.nhsa.gov.cn/',
    regexpPatches: { "['鈥橾": "\\['鈥橾" }
});
console.log('Browser environment initialized (via wbl library)\n');

// =============================================================================
// Load Bundles and Test
// =============================================================================

const BUNDLES = ['examples/bundles/nhsa/app.js', 'examples/bundles/nhsa/ServiceSearchModule.js'];

const loader = new WebpackBundleLoader();
console.log('Loading bundles...');
BUNDLES.forEach(b => loader.loadBundle(b));
console.log(`Loaded ${loader.totalModules} modules\n`);

async function runTest() {
    // Try to load the API module
    console.log('Loading API module 365c...');
    try {
        const apiModule = loader.require('365c');
        console.log('API module loaded successfully!');

        // The queryServiceFacilities function is available at apiModule.k.queryServiceFacilities
        const queryFunc = apiModule.k?.queryServiceFacilities;

        if (queryFunc && typeof queryFunc === 'function') {
            console.log('\nCalling queryServiceFacilities...');
            /*
               The function signature:
               function(e) { return f.a.post("/nthl/api/CommQuery/queryServiceFacilities", e) }
            */
            try {
                const result = await queryFunc({
                    pageNum: 1,
                    pageSize: 5
                });
                console.log('Result:', JSON.stringify(result, null, 2));
            } catch (error) {
                console.error('Error calling queryServiceFacilities:', error);
                if (error.response) {
                    console.error('Response:', error.response.status, error.response.data);
                }
                if (error.stack) console.error(error.stack);
            }
        } else {
            console.error('Failed to resolve queryServiceFacilities function.');
            console.error('Available keys in apiModule.k:', Object.keys(apiModule.k || {}));
        }

    } catch (error) {
        console.error('Error loading module:', error);
        if (error.stack) console.error(error.stack);
    }
}

runTest().catch(console.error);
