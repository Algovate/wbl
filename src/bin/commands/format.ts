/**
 * Format command - Show bundle format information
 */

import * as fs from 'fs';
import * as path from 'path';
import { BUNDLE_PATTERNS } from '../../lib/constants.js';
import { CommandContext } from '../types.js';

interface FormatInfo {
    file: string;
    format: string;
    webpackVersion: string;
    bundleType: string;
    details: string[];
}

/**
 * Detect bundle format without loading
 */
function detectFormat(filePath: string): FormatInfo {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);
    const details: string[] = [];

    let format = 'unknown';
    let webpackVersion = 'unknown';
    let bundleType = 'unknown';

    // Check for Webpack 5 patterns
    if (BUNDLE_PATTERNS.WEBPACK5_MODULES.test(content)) {
        webpackVersion = '5';

        if (BUNDLE_PATTERNS.WEBPACK5_UMD.test(content)) {
            format = 'webpack5-umd';
            bundleType = 'UMD Library';
            details.push('Universal Module Definition wrapper');
        } else if (BUNDLE_PATTERNS.WEBPACK5_ARROW_IIFE.test(content)) {
            format = 'webpack5-iife';
            bundleType = 'Arrow IIFE';
            details.push('ES6 arrow function IIFE wrapper');
        } else {
            format = 'webpack5';
            bundleType = 'Standard';
        }

        // Check for __webpack_modules__
        const modulesMatch = content.match(BUNDLE_PATTERNS.WEBPACK5_MODULES);
        if (modulesMatch) {
            details.push('Uses __webpack_modules__ object');
        }

        // Check for harmony exports
        if (content.includes('__webpack_require__.r')) {
            details.push('ES Module exports (__esModule)');
        }
        if (content.includes('__webpack_require__.d')) {
            details.push('Named exports via __webpack_require__.d');
        }
    }
    // Check for Webpack 4 patterns
    else if (content.startsWith(BUNDLE_PATTERNS.CHUNK_START)) {
        webpackVersion = '4';
        format = 'webpack4-chunk';
        bundleType = 'Chunk (webpackJsonp)';
        details.push('Uses webpackJsonp for chunk loading');
    }
    else if (BUNDLE_PATTERNS.MAIN.test(content)) {
        webpackVersion = '4';
        format = 'webpack4-main';
        bundleType = 'Main Bundle';
        details.push('Standard Webpack 4 IIFE wrapper');

        if (content.includes('__webpack_require__.r')) {
            details.push('ES Module exports');
        }
    }

    // Additional checks
    if (content.includes('eval(')) {
        details.push('⚠️  Development mode (contains eval)');
    }

    const sizeKB = (fs.statSync(filePath).size / 1024).toFixed(1);
    details.push(`File size: ${sizeKB} KB`);

    return {
        file: fileName,
        format,
        webpackVersion,
        bundleType,
        details
    };
}

export function cmdFormat(ctx: CommandContext, bundlePath?: string): void {
    const bundles = ctx.loader.getBundleInfo();

    if (bundles.length === 0 && !bundlePath) {
        console.log('No bundles loaded. Use -b to specify bundles.');
        return;
    }

    console.log('Bundle Format Analysis\n');
    console.log('='.repeat(60) + '\n');

    for (const bundle of bundles) {
        const formatInfo = detectFormat(bundle.path);

        console.log(`📦 ${formatInfo.file}`);
        console.log(`   Webpack Version: ${formatInfo.webpackVersion}`);
        console.log(`   Format: ${formatInfo.format}`);
        console.log(`   Type: ${formatInfo.bundleType}`);
        console.log(`   Modules Loaded: ${bundle.moduleCount}`);
        console.log('');
        console.log('   Details:');
        for (const detail of formatInfo.details) {
            console.log(`     • ${detail}`);
        }
        console.log('');
    }

    console.log('='.repeat(60));
    console.log(`\nTotal bundles: ${bundles.length}`);
}
