/**
 * Custom error classes for WBL
 */

/**
 * Error thrown when a bundle file cannot be loaded or parsed
 */
export class BundleLoadError extends Error {
    readonly bundleName: string;

    constructor(bundleName: string, reason: string) {
        super(`Failed to load bundle "${bundleName}": ${reason}`);
        this.name = 'BundleLoadError';
        this.bundleName = bundleName;
    }
}

/**
 * Error thrown when a requested module is not found
 */
export class ModuleNotFoundError extends Error {
    readonly moduleId: string;

    constructor(moduleId: string) {
        super(`Module "${moduleId}" not found`);
        this.name = 'ModuleNotFoundError';
        this.moduleId = moduleId;
    }
}

/**
 * Error thrown when a module fails to execute
 */
export class ModuleExecutionError extends Error {
    readonly moduleId: string;
    readonly originalError: Error;

    constructor(moduleId: string, originalError: Error) {
        super(`Error executing module "${moduleId}": ${originalError.message}`);
        this.name = 'ModuleExecutionError';
        this.moduleId = moduleId;
        this.originalError = originalError;
        // Preserve the original stack trace
        if (originalError.stack) {
            this.stack = originalError.stack;
        }
    }
}

/**
 * Error thrown when a bundle format is not recognized
 */
export class UnknownBundleFormatError extends Error {
    readonly bundleName: string;

    constructor(bundleName: string) {
        super(`Could not determine bundle format for "${bundleName}"`);
        this.name = 'UnknownBundleFormatError';
        this.bundleName = bundleName;
    }
}
