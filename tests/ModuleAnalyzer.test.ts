import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { WebpackBundleLoader } from '../src/lib/WebpackBundleLoader.js';
import { ModuleAnalyzer } from '../src/lib/ModuleAnalyzer.js';

describe('ModuleAnalyzer', () => {
    const bundlesDir = path.join(__dirname, '../examples/bundles/nhsa');
    const appBundle = path.join(bundlesDir, 'app.js');
    const chunkBundle = path.join(bundlesDir, 'ServiceSearchModule.js');

    let loader: WebpackBundleLoader;
    let analyzer: ModuleAnalyzer;

    beforeAll(() => {
        loader = new WebpackBundleLoader();
        loader.loadBundles([appBundle, chunkBundle]);
        analyzer = new ModuleAnalyzer(loader);
    });

    describe('listModules', () => {
        it('should list all modules with preview', () => {
            const modules = analyzer.listModules();

            expect(modules).toBeInstanceOf(Array);
            expect(modules.length).toBeGreaterThan(0);
            expect(modules[0]).toHaveProperty('id');
            expect(modules[0]).toHaveProperty('preview');
        });
    });

    describe('analyzeExports', () => {
        it('should analyze module exports', () => {
            const result = analyzer.analyzeExports('b381');

            expect(result.moduleId).toBe('b381');
            expect(result.type).toBe('object');
            expect(result.exports).toBeDefined();
            expect(Object.keys(result.exports).length).toBeGreaterThan(0);
        });

        it('should return error for non-existent module', () => {
            const result = analyzer.analyzeExports('non-existent');

            expect(result.error).toBeDefined();
        });

        it('should detect function exports', () => {
            const result = analyzer.analyzeExports('b381');

            const hasFunction = Object.values(result.exports).some(e => e.isFunction);
            expect(hasFunction).toBe(true);
        });
    });

    describe('analyzeDependencies', () => {
        it('should find module dependencies', () => {
            const result = analyzer.analyzeDependencies('7d92');

            expect(result.moduleId).toBe('7d92');
            expect(result.dependencies).toBeInstanceOf(Array);
            expect(result.count).toBe(result.dependencies.length);
        });

        it('should return error for non-existent module', () => {
            const result = analyzer.analyzeDependencies('non-existent');

            expect(result.error).toBeDefined();
        });
    });

    describe('findDependents', () => {
        it('should find modules that depend on target', () => {
            const result = analyzer.findDependents('b381');

            expect(result.moduleId).toBe('b381');
            expect(result.dependents).toBeInstanceOf(Array);
        });
    });

    describe('searchModules', () => {
        it('should search modules by pattern', () => {
            const modules = loader.getModuleIds();
            const pattern = modules[0].substring(0, 2);

            const matches = analyzer.searchModules(pattern);

            expect(matches.length).toBeGreaterThan(0);
            expect(matches[0]).toHaveProperty('id');
            expect(matches[0]).toHaveProperty('matchType');
        });

        it('should support wildcard search', () => {
            const matches = analyzer.searchModules('sm*');

            expect(matches).toBeInstanceOf(Array);
        });
    });

    describe('callMethod', () => {
        it('should call a module method', () => {
            // b381 has parseUtf8StringToHex function
            const result = analyzer.callMethod('b381', 'parseUtf8StringToHex', ['hello']);

            expect(result).toBe('68656c6c6f');
        });

        it('should throw for non-function export', () => {
            expect(() => analyzer.callMethod('b381', 'nonExistentMethod', [])).toThrow();
        });
    });

    describe('getSummary', () => {
        it('should return bundle summary', () => {
            const summary = analyzer.getSummary();

            expect(summary.bundles).toBeInstanceOf(Array);
            expect(summary.bundles.length).toBe(2);
            expect(summary.totalModules).toBeGreaterThan(0);

            expect(summary.bundles[0]).toHaveProperty('name');
            expect(summary.bundles[0]).toHaveProperty('format');
            expect(summary.bundles[0]).toHaveProperty('size');
            expect(summary.bundles[0]).toHaveProperty('modules');
        });
    });
});
