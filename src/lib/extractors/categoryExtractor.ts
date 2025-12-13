/**
 * Category Extractor
 * 
 * Categorize modules based on their source content.
 */

/** Module categories */
export type ModuleCategory =
    | 'crypto'
    | 'http'
    | 'api'
    | 'component'
    | 'router'
    | 'store'
    | 'storage'
    | 'validation'
    | 'util';

/**
 * Categorize module based on source content
 */
export function categorizeModule(source: string): ModuleCategory[] {
    const categories: ModuleCategory[] = [];
    const lowerSource = source.toLowerCase();

    // Check for various patterns
    if (lowerSource.includes('encrypt') || lowerSource.includes('decrypt') ||
        lowerSource.includes('sm2') || lowerSource.includes('sm4') ||
        lowerSource.includes('aes') || lowerSource.includes('rsa')) {
        categories.push('crypto');
    }

    if (lowerSource.includes('axios') || lowerSource.includes('fetch') ||
        lowerSource.includes('.post(') || lowerSource.includes('.get(') ||
        source.includes('XMLHttpRequest')) {
        categories.push('http');
    }

    if (source.includes('/api/') || source.includes('.api.')) {
        categories.push('api');
    }

    if (lowerSource.includes('vue') || lowerSource.includes('react') ||
        lowerSource.includes('component') || source.includes('render(')) {
        categories.push('component');
    }

    if (lowerSource.includes('router') || lowerSource.includes('route')) {
        categories.push('router');
    }

    if (lowerSource.includes('store') || lowerSource.includes('vuex') ||
        lowerSource.includes('redux') || lowerSource.includes('state')) {
        categories.push('store');
    }

    if (lowerSource.includes('localstorage') || lowerSource.includes('sessionstorage') ||
        lowerSource.includes('cookie')) {
        categories.push('storage');
    }

    if (lowerSource.includes('validate') || lowerSource.includes('validator')) {
        categories.push('validation');
    }

    if (lowerSource.includes('format') || lowerSource.includes('parse') ||
        lowerSource.includes('stringify')) {
        categories.push('util');
    }

    return categories;
}
