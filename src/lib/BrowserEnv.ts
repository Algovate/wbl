import { JSDOM, ResourceLoader, FetchOptions } from 'jsdom';
import { BROWSER_ENV_DEFAULTS } from './constants.js';

/**
 * Options for setting up the browser environment
 */
export interface BrowserEnvOptions {
    url?: string;
    referrer?: string;
    contentType?: string;
    storageQuota?: number;
    pretendToBeVisual?: boolean;
    runScripts?: "dangerously" | "outside-only";
    /**
     * Map of malformed RegExp patterns to their fixed versions.
     * Used to handle encoding issues in bundled code.
     * Example: { "['鈥橾": "\\['鈥橾" }
     */
    regexpPatches?: Record<string, string>;
}

/**
 * Result of setting up the browser environment
 */
export interface BrowserEnvResult {
    /** The JSDOM instance */
    dom: JSDOM;
    /** Cleanup function to remove injected globals and close JSDOM */
    cleanup: () => void;
}

// Track original RegExp for cleanup
let originalRegExp: RegExpConstructor | null = null;

/**
 * Sets up a simulated browser environment using JSDOM.
 * Injects window, document, and other globals into the Node.js global scope.
 * 
 * @param options Configuration options for JSDOM
 * @returns Object containing the JSDOM instance and a cleanup function
 */
export function setupBrowserEnv(options: BrowserEnvOptions = {}): BrowserEnvResult {
    const defaultOptions: BrowserEnvOptions = {
        url: BROWSER_ENV_DEFAULTS.URL,
        referrer: BROWSER_ENV_DEFAULTS.REFERRER,
        contentType: BROWSER_ENV_DEFAULTS.CONTENT_TYPE,
        storageQuota: BROWSER_ENV_DEFAULTS.STORAGE_QUOTA,
        runScripts: BROWSER_ENV_DEFAULTS.RUN_SCRIPTS,
        pretendToBeVisual: BROWSER_ENV_DEFAULTS.PRETEND_TO_BE_VISUAL
    };

    const finalOptions = { ...defaultOptions, ...options };

    // initialize JSDOM with a realistic environment
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: finalOptions.url,
        referrer: finalOptions.referrer,
        contentType: finalOptions.contentType,
        includeNodeLocations: true,
        storageQuota: finalOptions.storageQuota,
        runScripts: finalOptions.runScripts,
        resources: new ResourceLoader(),
        pretendToBeVisual: finalOptions.pretendToBeVisual
    });

    // Inject window and other globals
    const { window } = dom;

    // Track injected properties for cleanup
    const injectedProps: string[] = [];

    // Define global properties
    // We iterate over the window object and assign properties to globalThis
    // omitting those that already exist or shouldn't be overridden
    const skipProps = ['undefined', 'NaN', 'Infinity', 'console', 'process', 'window', 'self', 'top', 'globalThis', 'document', 'location', 'history', 'navigator'];

    Object.getOwnPropertyNames(window).forEach(prop => {
        if (skipProps.includes(prop)) return;

        try {
            // Only define if not already defined or if writable
            if (!(prop in globalThis)) {
                Object.defineProperty(globalThis, prop, {
                    get: () => window[prop as any],
                    set: (val) => { window[prop as any] = val; },
                    configurable: true
                });
                injectedProps.push(prop);
            }
        } catch (e) {
            // Ignore errors for properties that can't be redefined
        }
    });

    // Helper to set global properties safely
    const setGlobal = (prop: string, val: any) => {
        try {
            (globalThis as any)[prop] = val;
            injectedProps.push(prop);
        } catch (e) {
            Object.defineProperty(globalThis, prop, {
                value: val,
                writable: true,
                configurable: true
            });
            injectedProps.push(prop);
        }
    };

    // Explicitly set common globals
    setGlobal('window', window);
    setGlobal('document', window.document);
    setGlobal('navigator', window.navigator);
    setGlobal('location', window.location);
    setGlobal('history', window.history);
    setGlobal('localStorage', window.localStorage);
    setGlobal('sessionStorage', window.sessionStorage);
    setGlobal('XMLHttpRequest', window.XMLHttpRequest);
    setGlobal('FormData', window.FormData);
    setGlobal('URL', window.URL);

    // Also set self and top
    setGlobal('self', window);
    setGlobal('top', window);

    // Apply RegExp patches if provided
    if (finalOptions.regexpPatches && Object.keys(finalOptions.regexpPatches).length > 0) {
        originalRegExp = globalThis.RegExp;
        const patches = finalOptions.regexpPatches;

        const patchedRegExp = function (this: any, pattern: string | RegExp, flags?: string): RegExp {
            let fixedPattern = pattern;
            if (typeof pattern === 'string' && pattern in patches) {
                fixedPattern = patches[pattern];
            }
            // Handle both 'new RegExp()' and 'RegExp()' calls
            if (new.target) {
                return new originalRegExp!(fixedPattern, flags);
            }
            return originalRegExp!(fixedPattern, flags) as RegExp;
        } as any;

        // Copy RegExp properties and prototype chain
        patchedRegExp.prototype = originalRegExp.prototype;
        Object.setPrototypeOf(patchedRegExp, originalRegExp);
        Object.getOwnPropertyNames(originalRegExp).forEach(prop => {
            if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
                try {
                    const desc = Object.getOwnPropertyDescriptor(originalRegExp!, prop);
                    if (desc) Object.defineProperty(patchedRegExp, prop, desc);
                } catch (e) { /* ignore */ }
            }
        });

        globalThis.RegExp = patchedRegExp;
    }

    // Cleanup function
    const cleanup = () => {
        // Restore original RegExp if patched
        if (originalRegExp) {
            globalThis.RegExp = originalRegExp;
            originalRegExp = null;
        }

        // Remove injected global properties
        for (const prop of injectedProps) {
            try {
                delete (globalThis as any)[prop];
            } catch (e) {
                // Some properties may not be deletable
            }
        }

        // Close JSDOM
        dom.window.close();
    };

    return { dom, cleanup };
}

