/**
 * Source Map Demo - Main entry point
 * 
 * This module is built with source maps to demonstrate
 * WBL's source map resolution capabilities.
 */

export { fetchUser, validateEmail, formatUserName } from './api';
export type { User, ApiResponse } from './api';
export { formatDate, truncate, deepClone, debounce } from './utils';

// Version info
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
