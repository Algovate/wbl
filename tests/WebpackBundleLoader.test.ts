import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { WebpackBundleLoader } from '../src/lib/WebpackBundleLoader.js';

describe('WebpackBundleLoader', () => {
    const assetsDir = path.join(__dirname, '../assets');
    const appBundle = path.join(assetsDir, 'app.js');
    const chunkBundle = path.join(assetsDir, 'ServiceSearchModule.js');

    describe('loadBundle', () => {
        it('should load main bundle format', () => {
            const loader = new WebpackBundleLoader();
            const count = loader.loadBundle(appBundle);

            expect(count).toBeGreaterThan(0);
            expect(loader.totalModules).toBe(count);
        });

        it('should load chunk bundle format', () => {
            const loader = new WebpackBundleLoader();
            const count = loader.loadBundle(chunkBundle);

            expect(count).toBeGreaterThan(0);
        });

        it('should detect correct bundle formats', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);
            loader.loadBundle(chunkBundle);

            const info = loader.getBundleInfo();
            expect(info[0].format).toBe('main');
            expect(info[1].format).toBe('chunk');
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
            loader.loadBundle(appBundle);

            const ids = loader.getModuleIds();
            expect(ids).toBeInstanceOf(Array);
            expect(ids.length).toBeGreaterThan(0);
        });
    });

    describe('getModuleSource', () => {
        it('should return module source code', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);

            const ids = loader.getModuleIds();
            const source = loader.getModuleSource(ids[0]);

            expect(source).toBeDefined();
            expect(typeof source).toBe('string');
        });

        it('should return null for non-existent module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);

            const source = loader.getModuleSource('non-existent');
            expect(source).toBeNull();
        });
    });

    describe('hasModule', () => {
        it('should return true for existing module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);

            const ids = loader.getModuleIds();
            expect(loader.hasModule(ids[0])).toBe(true);
        });

        it('should return false for non-existent module', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);

            expect(loader.hasModule('non-existent')).toBe(false);
        });
    });

    describe('reset', () => {
        it('should clear all state', () => {
            const loader = new WebpackBundleLoader();
            loader.loadBundle(appBundle);

            expect(loader.totalModules).toBeGreaterThan(0);

            loader.reset();

            expect(loader.totalModules).toBe(0);
            expect(loader.getBundleInfo()).toHaveLength(0);
        });
    });
});
