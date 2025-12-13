/**
 * Tests for the SourceMapResolver utility
 * 
 * Note: Some tests are skipped if the sourcemap bundle doesn't exist.
 * Run `npm run build:samples` to build all sample projects with source maps.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the sourcemap-demo bundle with source map
const BUNDLE_PATH = path.join(__dirname, '../examples/bundles/sourcemap-demo.bundle.js');
const SOURCEMAP_PATH = path.join(__dirname, '../examples/bundles/sourcemap-demo.bundle.js.map');
const SIMPLE_BUNDLE_PATH = path.join(__dirname, '../examples/bundles/simple-math.bundle.js');

// Dynamically import the module to avoid vitest sourcemap conflict
async function getSourceMapUtils() {
    return await import('../src/lib/utils/sourceMap.js');
}

describe('SourceMapResolver', () => {
    describe('loadFromFile', () => {
        it('should load source map from file', async () => {
            // Check if sourcemap file exists (may not exist in CI)
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            expect(resolver.isLoaded()).toBe(true);

            const sources = resolver.getSources();
            expect(sources.length).toBeGreaterThan(0);

            resolver.destroy();
        });

        it('should throw error for non-existent file', async () => {
            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await expect(resolver.loadFromFile('/nonexistent/file.map'))
                .rejects.toThrow();
        });
    });

    describe('getSources', () => {
        it('should return source file paths', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            const sources = resolver.getSources();

            // Should contain TypeScript source files
            expect(sources.some(s => s.includes('index.ts') || s.includes('api.ts') || s.includes('utils.ts'))).toBe(true);

            resolver.destroy();
        });

        it('should return empty array when not loaded', async () => {
            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();
            expect(resolver.getSources()).toEqual([]);
        });
    });

    describe('getSourceContent', () => {
        it('should return original source content', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            const sources = resolver.getSources();

            if (sources.length > 0) {
                const content = resolver.getSourceContent(sources[0]);
                expect(content).not.toBeNull();
                // Should contain TypeScript syntax
                if (content) {
                    expect(content.includes('export') || content.includes('function')).toBe(true);
                }
            }

            resolver.destroy();
        });

        it('should return null for unknown source', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            const content = resolver.getSourceContent('nonexistent.ts');
            expect(content).toBeNull();

            resolver.destroy();
        });
    });

    describe('loadFromBundle', () => {
        it('should detect external source map reference', async () => {
            if (!fs.existsSync(BUNDLE_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            const loaded = await resolver.loadFromBundle(BUNDLE_PATH);
            expect(loaded).toBe(true);
            expect(resolver.isLoaded()).toBe(true);

            resolver.destroy();
        });

        it('should return false for bundle without source map', async () => {
            if (!fs.existsSync(SIMPLE_BUNDLE_PATH)) {
                console.log('Skipping test: simple-math.bundle.js not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            const loaded = await resolver.loadFromBundle(SIMPLE_BUNDLE_PATH);
            expect(loaded).toBe(false);
        });
    });

    describe('mapPosition', () => {
        it('should map position to original source', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);

            // Map a position (line 10, column 0 - just an example)
            const result = await resolver.mapPosition(10, 0);

            // May or may not find a mapping depending on the line
            if (result.sourcePath) {
                expect(result.originalPosition).not.toBeNull();
            }

            resolver.destroy();
        });

        it('should return null values when not loaded', async () => {
            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();
            const result = await resolver.mapPosition(1, 0);

            expect(result.originalSource).toBeNull();
            expect(result.originalPosition).toBeNull();
            expect(result.sourcePath).toBeNull();
        });
    });

    describe('isLoaded', () => {
        it('should return false initially', async () => {
            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();
            expect(resolver.isLoaded()).toBe(false);
        });

        it('should return true after loading', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            expect(resolver.isLoaded()).toBe(true);

            resolver.destroy();
        });

        it('should return false after destroy', async () => {
            if (!fs.existsSync(SOURCEMAP_PATH)) {
                console.log('Skipping test: sourcemap-demo.bundle.js.map not found');
                return;
            }

            const { SourceMapResolver } = await getSourceMapUtils();
            const resolver = new SourceMapResolver();

            await resolver.loadFromFile(SOURCEMAP_PATH);
            resolver.destroy();
            expect(resolver.isLoaded()).toBe(false);
        });
    });
});

describe('extractInlineSourceMap', () => {
    it('should extract base64 inline source map', async () => {
        const { extractInlineSourceMap } = await getSourceMapUtils();
        const content = `
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozfQ==
        `;
        const result = extractInlineSourceMap(content);
        expect(result).toContain('data:application/json;base64,');
    });

    it('should return null for external source map reference', async () => {
        const { extractInlineSourceMap } = await getSourceMapUtils();
        const content = `
            //# sourceMappingURL=bundle.js.map
        `;
        const result = extractInlineSourceMap(content);
        expect(result).toBeNull();
    });

    it('should return null for content without source map', async () => {
        const { extractInlineSourceMap } = await getSourceMapUtils();
        const content = 'function test() { return 1; }';
        const result = extractInlineSourceMap(content);
        expect(result).toBeNull();
    });
});

describe('getExternalSourceMapPath', () => {
    it('should return path for external source map', async () => {
        const { getExternalSourceMapPath } = await getSourceMapUtils();
        const content = `
            function test() {}
            //# sourceMappingURL=bundle.js.map
        `;
        const bundlePath = '/path/to/bundle.js';
        const result = getExternalSourceMapPath(content, bundlePath);
        expect(result).toBe('/path/to/bundle.js.map');
    });

    it('should return null for inline source map', async () => {
        const { getExternalSourceMapPath } = await getSourceMapUtils();
        const content = `
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozfQ==
        `;
        const bundlePath = '/path/to/bundle.js';
        const result = getExternalSourceMapPath(content, bundlePath);
        expect(result).toBeNull();
    });

    it('should return null for content without source map', async () => {
        const { getExternalSourceMapPath } = await getSourceMapUtils();
        const content = 'function test() { return 1; }';
        const bundlePath = '/path/to/bundle.js';
        const result = getExternalSourceMapPath(content, bundlePath);
        expect(result).toBeNull();
    });
});
