/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import { findMatchingBrace, formatSize, truncate, getValuePreview } from '../src/lib/utils/index.js';

describe('findMatchingBrace', () => {
    it('should find matching brace for simple object', () => {
        const content = '{ a: 1 }';
        expect(findMatchingBrace(content, 0)).toBe(7);
    });

    it('should find matching brace for nested objects', () => {
        const content = '{ a: { b: 1 } }';
        expect(findMatchingBrace(content, 0)).toBe(14);
        expect(findMatchingBrace(content, 5)).toBe(12);
    });

    it('should ignore braces in strings', () => {
        const content = '{ a: "{ not a brace }" }';
        expect(findMatchingBrace(content, 0)).toBe(23);
    });

    it('should handle escape sequences in strings', () => {
        const content = '{ a: "escaped \\" quote" }';
        expect(findMatchingBrace(content, 0)).toBe(24);
    });

    it('should return -1 for invalid input', () => {
        expect(findMatchingBrace('abc', 0)).toBe(-1);
        expect(findMatchingBrace('{ a }', -1)).toBe(-1);
        expect(findMatchingBrace('{ a }', 100)).toBe(-1);
    });

    it('should return -1 for unmatched braces', () => {
        expect(findMatchingBrace('{ a: 1', 0)).toBe(-1);
    });
});

describe('formatSize', () => {
    it('should format bytes', () => {
        expect(formatSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
        expect(formatSize(1024)).toBe('1.00 KB');
        expect(formatSize(2048)).toBe('2.00 KB');
    });

    it('should format megabytes', () => {
        expect(formatSize(1024 * 1024)).toBe('1.00 MB');
        expect(formatSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });
});

describe('truncate', () => {
    it('should not truncate short strings', () => {
        expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings', () => {
        expect(truncate('hello world', 5)).toBe('hello...');
    });

    it('should use default max length', () => {
        const longString = 'a'.repeat(100);
        const result = truncate(longString);
        expect(result.endsWith('...')).toBe(true);
        expect(result.length).toBeLessThan(100);
    });
});

describe('getValuePreview', () => {
    it('should handle null', () => {
        expect(getValuePreview(null)).toBe('null');
    });

    it('should handle undefined', () => {
        expect(getValuePreview(undefined)).toBe('undefined');
    });

    it('should handle functions', () => {
        function namedFn() { }
        expect(getValuePreview(namedFn)).toBe('namedFn');
        expect(getValuePreview(() => { })).toBe('(anonymous function)');
    });

    it('should handle arrays', () => {
        expect(getValuePreview([1, 2, 3])).toBe('Array(3)');
        expect(getValuePreview([])).toBe('Array(0)');
    });

    it('should handle objects', () => {
        expect(getValuePreview({ a: 1, b: 2 })).toBe('Object{a, b}');
        expect(getValuePreview({ a: 1, b: 2, c: 3, d: 4 })).toBe('Object{a, b, c...}');
    });

    it('should handle strings', () => {
        expect(getValuePreview('hello')).toBe('hello');
    });

    it('should handle numbers', () => {
        expect(getValuePreview(42)).toBe('42');
    });

    it('should handle booleans', () => {
        expect(getValuePreview(true)).toBe('true');
    });
});
