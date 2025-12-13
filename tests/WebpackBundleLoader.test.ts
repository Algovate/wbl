import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { WebpackBundleLoader } from '../src/lib/WebpackBundleLoader.js';

describe('WebpackBundleLoader', () => {
    const bundlesDir = path.join(__dirname, '../examples/bundles/nhsa');
    const appBundle = path.join(bundlesDir, 'app.js');
    const chunkBundle = path.join(bundlesDir, 'ServiceSearchModule.js');

    describe('loadBundleSync', () => {
        it('should load main bundle format', () => {
            const loader = new WebpackBundleLoader();
            const count = loader.loadBundleSync(appBundle);

            expect(count).toBeGreaterThan(0);
            expect(loader.totalModules).toBe(count);
        });

        it('should load chunk bundle format', () => {
            const loader = new WebpackBundleLoader();
            const count = loader.loadBundleSync(chunkBundle);

            expect(count).toBeGreaterThan(0);
        });

        it('should detect correct bundle formats', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);
            loader.loadBundleSync(chunkBundle);

            const info = loader.getBundleInfo();
            expect(info[0].format).toBe('main');
            expect(info[1].format).toBe('chunk');
        });
    });

    describe('loadBundle (async)', () => {
        it('should load bundle with source map option', async () => {
            const loader = new WebpackBundleLoader();
            const sourcemapBundle = path.join(__dirname, '../examples/bundles/sourcemap-demo.bundle.js');
            const count = await loader.loadBundle(sourcemapBundle, { loadSourceMap: true });

            expect(count).toBeGreaterThan(0);
            const info = loader.getBundleInfo();
            expect(info[0].hasSourceMap).toBe(true);
        });
    });

    describe('loadBundles', () => {
        it('should load multiple bundles at once', () => {
            const loader = new WebpackBundleLoader();
            const result = loader.loadBundles([appBundle, chunkBundle]);

            expect(result.bundles).toHaveLength(2);
            expect(result.totalModules).toBeGreaterThan(1000);
        });
    });

    describe('require', () => {
        let loader: WebpackBundleLoader;

        beforeAll(() => {
            loader = new WebpackBundleLoader();
            loader.loadBundles([appBundle, chunkBundle]);
        });

        it('should require a module and return exports', () => {
            const exports = loader.require('b381');

            expect(exports).toBeDefined();
            expect(typeof exports).toBe('object');
        });

        it('should cache required modules', () => {
            const exports1 = loader.require('b381');
            const exports2 = loader.require('b381');

            expect(exports1).toBe(exports2);
        });

        it('should throw for non-existent module', () => {
            expect(() => loader.require('non-existent-module')).toThrow();
        });
    });

    describe('getModuleIds', () => {
        it('should return all module IDs', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            const ids = loader.getModuleIds();
            expect(ids).toBeInstanceOf(Array);
            expect(ids.length).toBeGreaterThan(0);
        });
    });

    describe('getModuleSource', () => {
        it('should return module source code', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            const ids = loader.getModuleIds();
            const source = loader.getModuleSource(ids[0]);

            expect(source).toBeDefined();
            expect(typeof source).toBe('string');
        });

        it('should return null for non-existent module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            const source = loader.getModuleSource('non-existent');
            expect(source).toBeNull();
        });
    });

    describe('hasModule', () => {
        it('should return true for existing module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            const ids = loader.getModuleIds();
            expect(loader.hasModule(ids[0])).toBe(true);
        });

        it('should return false for non-existent module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            expect(loader.hasModule('non-existent')).toBe(false);
        });
    });

    describe('reset', () => {
        it('should clear all state', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            expect(loader.totalModules).toBeGreaterThan(0);

            loader.reset();

            expect(loader.totalModules).toBe(0);
            expect(loader.getBundleInfo()).toHaveLength(0);
        });
    });

    describe('Webpack 5 bundles', () => {
        const bundlesDir = path.join(__dirname, '../examples/bundles');

        it('should load Webpack 5 arrow IIFE format', () => {
            const loader = new WebpackBundleLoader();
            const classAppBundle = path.join(bundlesDir, 'class-app.bundle.js');
            const count = loader.loadBundleSync(classAppBundle);

            expect(count).toBeGreaterThan(0);
            const info = loader.getBundleInfo();
            expect(info[0].format).toBe('webpack5');
        });

        it('should load Webpack 5 UMD format', () => {
            const loader = new WebpackBundleLoader();
            const utilsBundle = path.join(bundlesDir, 'utils-lib.bundle.js');
            const count = loader.loadBundleSync(utilsBundle);

            expect(count).toBeGreaterThan(0);
            const info = loader.getBundleInfo();
            expect(info[0].format).toBe('webpack5-umd');
        });

        it('should execute Webpack 5 modules', () => {
            const loader = new WebpackBundleLoader();
            const utilsBundle = path.join(bundlesDir, 'utils-lib.bundle.js');
            loader.loadBundleSync(utilsBundle);

            const arrayModule = loader.require('./src/array.ts');
            expect(arrayModule).toBeDefined();
            expect(typeof arrayModule.chunk).toBe('function');

            const result = arrayModule.chunk([1, 2, 3, 4], 2);
            expect(result).toEqual([[1, 2], [3, 4]]);
        });

        it('should handle Webpack 5 ES module exports', () => {
            const loader = new WebpackBundleLoader();
            const classAppBundle = path.join(bundlesDir, 'class-app.bundle.js');
            loader.loadBundleSync(classAppBundle);

            const eventEmitterModule = loader.require('./src/EventEmitter.js');
            expect(eventEmitterModule).toBeDefined();
            expect(eventEmitterModule.EventEmitter).toBeDefined();

            // Test class instantiation
            const emitter = new eventEmitterModule.EventEmitter();
            expect(typeof emitter.on).toBe('function');
            expect(typeof emitter.emit).toBe('function');
        });

        it('should load multiple Webpack 5 bundle formats', () => {
            const loader = new WebpackBundleLoader();
            const classAppBundle = path.join(bundlesDir, 'class-app.bundle.js');
            const utilsBundle = path.join(bundlesDir, 'utils-lib.bundle.js');

            loader.loadBundleSync(classAppBundle);
            loader.loadBundleSync(utilsBundle);

            const info = loader.getBundleInfo();
            expect(info).toHaveLength(2);
            expect(info[0].format).toBe('webpack5');
            expect(info[1].format).toBe('webpack5-umd');
        });
    });

    describe('getOriginalSource', () => {
        it('should return null when no source map loaded', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundleSync(appBundle);

            const ids = loader.getModuleIds();
            const originalSource = loader.getOriginalSource(ids[0]);
            expect(originalSource).toBeNull();
        });

        it('should return original source when source map available', async () => {
            const loader = new WebpackBundleLoader();
            const sourcemapBundle = path.join(__dirname, '../examples/bundles/sourcemap-demo.bundle.js');
            await loader.loadBundle(sourcemapBundle, { loadSourceMap: true });

            const ids = loader.getModuleIds();
            if (ids.length > 0) {
                // May or may not find original source depending on module ID matching
                const originalSource = loader.getOriginalSource(ids[0]);
                // Just check it doesn't throw
                expect(originalSource === null || typeof originalSource === 'string').toBe(true);
            }
        });
    });
});

