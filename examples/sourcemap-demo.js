/**
 * Source Map Demo
 * 
 * Demonstrates how to use WBL's source map resolution feature
 * to view original TypeScript source from a minified webpack bundle.
 * 
 * Run with: node examples/sourcemap-demo.js
 */

import { WebpackBundleLoader, ModuleAnalyzer, SourceMapResolver } from '../dist/index.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    console.log('='.repeat(60));
    console.log('WBL Source Map Demo');
    console.log('='.repeat(60));
    console.log();

    // Paths to bundle and source map
    const bundlePath = path.join(__dirname, 'bundles/sourcemap-demo.bundle.js');
    const sourceMapPath = path.join(__dirname, 'bundles/sourcemap-demo.bundle.js.map');

    // 1. Load the webpack bundle
    console.log('1. Loading webpack bundle...');
    const loader = new WebpackBundleLoader();
    const moduleCount = loader.loadBundleSync(bundlePath);
    console.log(`   Loaded ${moduleCount} modules\n`);


    // 2. List modules
    console.log('2. Available modules:');
    const moduleIds = loader.getModuleIds();
    for (const id of moduleIds) {
        console.log(`   - ${id}`);
    }
    console.log();

    // 3. Show minified source
    console.log('3. Minified source (first module):');
    const firstModule = moduleIds[0];
    const minifiedSource = loader.getModuleSource(firstModule);
    if (minifiedSource) {
        console.log('   ' + minifiedSource.substring(0, 200).replace(/\n/g, ' ') + '...');
    }
    console.log();

    // 4. Load source map and show original sources
    console.log('4. Loading source map...');
    const resolver = new SourceMapResolver();

    try {
        await resolver.loadFromFile(sourceMapPath);
        console.log('   Source map loaded successfully!\n');

        // 5. List original source files
        console.log('5. Original source files in source map:');
        const sources = resolver.getSources();
        for (const source of sources) {
            console.log(`   - ${source}`);
        }
        console.log();

        // 6. Show original source content
        console.log('6. Original TypeScript source:');
        for (const source of sources) {
            const content = resolver.getSourceContent(source);
            if (content) {
                console.log(`\n   --- ${source} ---`);
                // Show first 500 chars
                const preview = content.substring(0, 500);
                console.log('   ' + preview.split('\n').join('\n   '));
                if (content.length > 500) {
                    console.log(`   ... (${content.length - 500} more chars)`);
                }
            }
        }
        console.log();

        // 7. Map a position
        console.log('7. Position mapping example:');
        const result = await resolver.mapPosition(20, 0);
        if (result.sourcePath) {
            console.log(`   Line 20, Column 0 in minified code maps to:`);
            console.log(`   - Source: ${result.sourcePath}`);
            console.log(`   - Line: ${result.originalPosition?.line}`);
            console.log(`   - Column: ${result.originalPosition?.column}`);
        } else {
            console.log('   No mapping found for line 20, column 0');
        }

        // Cleanup
        resolver.destroy();

    } catch (error) {
        console.error('   Error loading source map:', error.message);
        console.log('   Make sure to build the sourcemap-demo project first:');
        console.log('   npm run build:samples');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Demo complete!');
    console.log('='.repeat(60));
}

main().catch(console.error);
