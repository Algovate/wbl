/**
 * WBL Demo - Comprehensive Example
 * 
 * Demonstrates core WBL functionality:
 * 1. Loading bundles (main, chunk, Webpack 5 formats)
 * 2. Module execution and interaction
 * 3. Module analysis (exports, dependencies, search)
 */

import { WebpackBundleLoader, ModuleAnalyzer } from '../dist/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// =============================================================================
// 1. Load Multiple Bundle Formats
// =============================================================================

console.log('📦 Loading bundles...\n');

const loader = new WebpackBundleLoader();

const bundles = [
    { name: 'simple-math (Webpack 4 main)', path: 'bundles/simple-math.bundle.js' },
    { name: 'string-utils (Webpack 4 chunk)', path: 'bundles/string-utils.chunk.js' },
    { name: 'utils-lib (Webpack 5 UMD)', path: 'bundles/utils-lib.bundle.js' },
    { name: 'class-app (Webpack 5 IIFE)', path: 'bundles/class-app.bundle.js' }
];

bundles.forEach(b => {
    const count = loader.loadBundle(join(__dirname, b.path));
    console.log(`   ✓ ${b.name}: ${count} modules`);
});
console.log(`\n   Total: ${loader.totalModules} modules\n`);

// =============================================================================
// 2. Bundle Information
// =============================================================================

console.log('📊 Bundle Information:\n');
loader.getBundleInfo().forEach(info => {
    console.log(`   ${info.name}: ${info.format} (${info.size} MB)`);
});
console.log();

// =============================================================================
// 3. Using Modules
// =============================================================================

console.log('🔧 Using Modules:\n');

// Webpack 4 main bundle
const math = loader.require('main');
console.log('   From simple-math:');
console.log(`   - add(10, 5) = ${math.add(10, 5)}`);
console.log(`   - Calculator: 10 → +5 → *2 = ${new math.Calculator(10).add(5).multiply(2).getResult()}`);

// Webpack 4 chunk bundle  
const strings = loader.require('stringUtils');
console.log('\n   From string-utils:');
console.log(`   - capitalize("hello") = "${strings.capitalize("hello")}"`);
console.log(`   - camelCase("hello-world") = "${strings.camelCase("hello-world")}"`);

// Webpack 5 bundles
const arrayUtils = loader.require('./src/array.ts');
console.log('\n   From utils-lib (Webpack 5):');
console.log(`   - chunk([1,2,3,4], 2) = ${JSON.stringify(arrayUtils.chunk([1, 2, 3, 4], 2))}`);

const EventEmitter = loader.require('./src/EventEmitter.js').EventEmitter;
const emitter = new EventEmitter();
let received = null;
emitter.on('test', msg => received = msg);
emitter.emit('test', 'Hello!');
console.log('\n   From class-app (Webpack 5):');
console.log(`   - EventEmitter received: "${received}"`);
console.log();

// =============================================================================
// 4. Module Analysis
// =============================================================================

console.log('🔍 Module Analysis:\n');

const analyzer = new ModuleAnalyzer(loader);

// Analyze exports
const calcExports = analyzer.analyzeExports('calculator');
console.log(`   calculator exports: ${Object.keys(calcExports.exports).join(', ')}`);

// Search modules
const results = analyzer.searchModules('add');
console.log(`   Search "add": found in ${results.map(r => r.id).join(', ')}`);

// Summary
const summary = analyzer.getSummary();
console.log(`\n   Summary: ${summary.totalModules} modules across ${summary.bundles.length} bundles`);
console.log();

console.log('✅ Demo completed!');
