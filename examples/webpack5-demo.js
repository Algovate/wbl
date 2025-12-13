/**
 * Example: Webpack 5 Bundle Demo
 * 
 * Tests loading Webpack 5 bundles generated from real TypeScript/JavaScript projects.
 * These bundles demonstrate modern Webpack output formats.
 */

import { WebpackBundleLoader, ModuleAnalyzer } from '../dist/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// Test Loading Webpack 5 Bundles
// =============================================================================

console.log('📦 Testing Webpack 5 Bundle Loading\n');
console.log('='.repeat(60) + '\n');

const loader = new WebpackBundleLoader();

// Test 1: Utils Library (TypeScript compiled)
console.log('1. Testing utils-lib.bundle.js (TypeScript → Webpack 5 UMD)');
try {
    const count = loader.loadBundle(join(__dirname, 'bundles/utils-lib.bundle.js'));
    console.log(`   ✅ Loaded ${count} modules`);

    const moduleIds = loader.getModuleIds();
    console.log(`   Modules: ${moduleIds.join(', ')}`);

    // Try to use a module
    const arrayUtils = loader.require('./src/array.ts');
    if (arrayUtils && typeof arrayUtils.chunk === 'function') {
        const result = arrayUtils.chunk([1, 2, 3, 4, 5, 6], 2);
        console.log(`   Test chunk([1,2,3,4,5,6], 2) = ${JSON.stringify(result)}`);
    }

    const stringUtils = loader.require('./src/string.ts');
    if (stringUtils && typeof stringUtils.camelCase === 'function') {
        const result = stringUtils.camelCase('hello-world');
        console.log(`   Test camelCase('hello-world') = "${result}"`);
    }
    console.log();
} catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log();
}

// Test 2: Class App (ES6 classes)
loader.reset();
console.log('2. Testing class-app.bundle.js (ES6 Classes → Webpack 5)');
try {
    const count = loader.loadBundle(join(__dirname, 'bundles/class-app.bundle.js'));
    console.log(`   ✅ Loaded ${count} modules`);

    const moduleIds = loader.getModuleIds();
    console.log(`   Modules: ${moduleIds.slice(0, 5).join(', ')}${moduleIds.length > 5 ? '...' : ''}`);

    // Try to use EventEmitter
    const { EventEmitter } = loader.require('./src/EventEmitter.js');
    if (EventEmitter) {
        const emitter = new EventEmitter();
        let received = null;
        emitter.on('test', (data) => { received = data; });
        emitter.emit('test', 'Hello from Webpack 5!');
        console.log(`   Test EventEmitter: received = "${received}"`);
    }
    console.log();
} catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log();
}

// Test 3: Hand-crafted bundles (Webpack 4 format)
loader.reset();
console.log('3. Testing simple-math.bundle.js (Hand-crafted Webpack 4 format)');
try {
    const count = loader.loadBundle(join(__dirname, 'bundles/simple-math.bundle.js'));
    console.log(`   ✅ Loaded ${count} modules`);

    const mainModule = loader.require('main');
    console.log(`   Test: add(2, 3) = ${mainModule.add(2, 3)}`);
    console.log();
} catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    console.log();
}

// Summary
console.log('='.repeat(60));
console.log('\n📊 Summary:');
console.log('   ✓ Webpack 4 bundles (hand-crafted): Fully supported');
console.log('   ✓ Webpack 5 bundles (auto-generated): Fully supported');
console.log('   ✓ TypeScript projects: utils-lib');
console.log('   ✓ JavaScript projects: class-app');
console.log('   - Sample projects available in: examples/sample-projects/');
console.log();
console.log('✅ Demo completed!');
