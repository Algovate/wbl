/**
 * Tests for constants
 */

import { describe, it, expect } from 'vitest';
import {
    BUNDLE_PATTERNS,
    REQUIRE_PATTERNS,
    BROWSER_ENV_DEFAULTS,
    CLI_CONFIG,
    LIMITS
} from '../src/lib/constants.js';

describe('BUNDLE_PATTERNS', () => {
    it('should have MAIN pattern as regex', () => {
        expect(BUNDLE_PATTERNS.MAIN).toBeInstanceOf(RegExp);
        expect(BUNDLE_PATTERNS.MAIN.test('}({')).toBe(true);
    });

    it('should have CHUNK_START as string', () => {
        expect(typeof BUNDLE_PATTERNS.CHUNK_START).toBe('string');
        expect(BUNDLE_PATTERNS.CHUNK_START).toBe('(window.webpackJsonp');
    });

    it('should have CHUNK_MODULES as string', () => {
        expect(typeof BUNDLE_PATTERNS.CHUNK_MODULES).toBe('string');
        expect(BUNDLE_PATTERNS.CHUNK_MODULES).toBe('], {');
    });
});

describe('REQUIRE_PATTERNS', () => {
    it('should be an array of regex patterns', () => {
        expect(Array.isArray(REQUIRE_PATTERNS)).toBe(true);
        expect(REQUIRE_PATTERNS.length).toBeGreaterThan(0);
        REQUIRE_PATTERNS.forEach(pattern => {
            expect(pattern).toBeInstanceOf(RegExp);
        });
    });

    it('should match webpack require patterns', () => {
        const testCases = [
            { source: 'e("abc123")', expected: 'abc123' },
            { source: 't("xyz")', expected: 'xyz' },
            { source: 'n("mod")', expected: 'mod' },
            { source: '__webpack_require__("test")', expected: 'test' },
        ];

        testCases.forEach(({ source, expected }) => {
            let found = false;
            for (const pattern of REQUIRE_PATTERNS) {
                const regex = new RegExp(pattern.source, pattern.flags);
                const match = regex.exec(source);
                if (match && match[1] === expected) {
                    found = true;
                    break;
                }
            }
            expect(found).toBe(true);
        });
    });
});

describe('BROWSER_ENV_DEFAULTS', () => {
    it('should have URL', () => {
        expect(BROWSER_ENV_DEFAULTS.URL).toBe('https://example.com/');
    });

    it('should have REFERRER', () => {
        expect(BROWSER_ENV_DEFAULTS.REFERRER).toBe('https://example.com/');
    });

    it('should have CONTENT_TYPE', () => {
        expect(BROWSER_ENV_DEFAULTS.CONTENT_TYPE).toBe('text/html');
    });

    it('should have STORAGE_QUOTA', () => {
        expect(BROWSER_ENV_DEFAULTS.STORAGE_QUOTA).toBe(10_000_000);
    });

    it('should have RUN_SCRIPTS', () => {
        expect(BROWSER_ENV_DEFAULTS.RUN_SCRIPTS).toBe('dangerously');
    });

    it('should have PRETEND_TO_BE_VISUAL', () => {
        expect(BROWSER_ENV_DEFAULTS.PRETEND_TO_BE_VISUAL).toBe(true);
    });
});

describe('CLI_CONFIG', () => {
    it('should have NAME', () => {
        expect(CLI_CONFIG.NAME).toBe('wbl');
    });

    it('should have VERSION', () => {
        expect(typeof CLI_CONFIG.VERSION).toBe('string');
    });

    it('should have DESCRIPTION', () => {
        expect(typeof CLI_CONFIG.DESCRIPTION).toBe('string');
    });
});

describe('LIMITS', () => {
    it('should have SOURCE_PREVIEW', () => {
        expect(LIMITS.SOURCE_PREVIEW).toBe(3000);
    });

    it('should have BODY_SNIPPET', () => {
        expect(LIMITS.BODY_SNIPPET).toBe(80);
    });

    it('should have VALUE_PREVIEW', () => {
        expect(LIMITS.VALUE_PREVIEW).toBe(50);
    });

    it('should have SEARCH_RESULTS', () => {
        expect(LIMITS.SEARCH_RESULTS).toBe(20);
    });
});
