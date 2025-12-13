/**
 * CLI Output Utilities
 * 
 * Shared output formatting for CLI commands.
 */

/**
 * Print a formatted header
 */
export function printHeader(title: string): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${title}`);
    console.log('='.repeat(60) + '\n');
}

/**
 * Print a section header
 */
export function printSection(title: string): void {
    console.log(`\n${title}`);
    console.log('-'.repeat(40));
}

/**
 * Print a key-value pair
 */
export function printKeyValue(key: string, value: unknown, indent = 2): void {
    const spaces = ' '.repeat(indent);
    console.log(`${spaces}${key}: ${formatValue(value)}`);
}

/**
 * Print a list item
 */
export function printListItem(item: string, indent = 2): void {
    const spaces = ' '.repeat(indent);
    console.log(`${spaces}• ${item}`);
}

/**
 * Format a value for display
 */
export function formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return 'function';
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return '[Object]';
        }
    }
    return String(value);
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Print success message
 */
export function printSuccess(message: string): void {
    console.log(`✓ ${message}`);
}

/**
 * Print error message
 */
export function printError(message: string): void {
    console.error(`✗ ${message}`);
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
    console.warn(`⚠ ${message}`);
}
