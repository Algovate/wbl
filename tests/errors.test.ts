/**
 * Tests for custom error classes
 */

import { describe, it, expect } from 'vitest';
import {
    BundleLoadError,
    ModuleNotFoundError,
    ModuleExecutionError,
    UnknownBundleFormatError
} from '../src/lib/errors.js';

describe('BundleLoadError', () => {
    it('should create error with bundle name and reason', () => {
        const error = new BundleLoadError('app.js', 'file not found');
        expect(error.name).toBe('BundleLoadError');
        expect(error.bundleName).toBe('app.js');
        expect(error.message).toBe('Failed to load bundle "app.js": file not found');
    });

    it('should be instanceof Error', () => {
        const error = new BundleLoadError('test.js', 'reason');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(BundleLoadError);
    });
});

describe('ModuleNotFoundError', () => {
    it('should create error with module id', () => {
        const error = new ModuleNotFoundError('abc123');
        expect(error.name).toBe('ModuleNotFoundError');
        expect(error.moduleId).toBe('abc123');
        expect(error.message).toBe('Module "abc123" not found');
    });

    it('should be instanceof Error', () => {
        const error = new ModuleNotFoundError('test');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ModuleNotFoundError);
    });
});

describe('ModuleExecutionError', () => {
    it('should create error with module id and original error', () => {
        const originalError = new Error('TypeError: undefined is not a function');
        const error = new ModuleExecutionError('xyz789', originalError);
        expect(error.name).toBe('ModuleExecutionError');
        expect(error.moduleId).toBe('xyz789');
        expect(error.originalError).toBe(originalError);
        expect(error.message).toBe('Error executing module "xyz789": TypeError: undefined is not a function');
    });

    it('should preserve original stack trace', () => {
        const originalError = new Error('original');
        const error = new ModuleExecutionError('mod', originalError);
        expect(error.stack).toBe(originalError.stack);
    });

    it('should be instanceof Error', () => {
        const error = new ModuleExecutionError('test', new Error('test'));
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ModuleExecutionError);
    });
});

describe('UnknownBundleFormatError', () => {
    it('should create error with bundle name', () => {
        const error = new UnknownBundleFormatError('weird.js');
        expect(error.name).toBe('UnknownBundleFormatError');
        expect(error.bundleName).toBe('weird.js');
        expect(error.message).toBe('Could not determine bundle format for "weird.js"');
    });

    it('should be instanceof Error', () => {
        const error = new UnknownBundleFormatError('test.js');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(UnknownBundleFormatError);
    });
});
