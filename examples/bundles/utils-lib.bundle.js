(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["UtilsLib"] = factory();
	else
		root["UtilsLib"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/array.ts":
/*!**********************!*\
  !*** ./src/array.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   chunk: () => (/* binding */ chunk),
/* harmony export */   difference: () => (/* binding */ difference),
/* harmony export */   flatten: () => (/* binding */ flatten),
/* harmony export */   groupBy: () => (/* binding */ groupBy),
/* harmony export */   intersection: () => (/* binding */ intersection),
/* harmony export */   shuffle: () => (/* binding */ shuffle),
/* harmony export */   takeRight: () => (/* binding */ takeRight),
/* harmony export */   unique: () => (/* binding */ unique)
/* harmony export */ });
/**
 * Array Utility Functions
 */
/**
 * Chunk an array into smaller arrays of specified size
 */
function chunk(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}
/**
 * Get unique values from an array
 */
function unique(array) {
    return [...new Set(array)];
}
/**
 * Flatten a nested array
 */
function flatten(array) {
    return array.reduce((acc, item) => {
        if (Array.isArray(item)) {
            return acc.concat(flatten(item));
        }
        return acc.concat(item);
    }, []);
}
/**
 * Group array items by a key
 */
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}
/**
 * Find the difference between two arrays
 */
function difference(arr1, arr2) {
    const set2 = new Set(arr2);
    return arr1.filter(item => !set2.has(item));
}
/**
 * Find the intersection of two arrays
 */
function intersection(arr1, arr2) {
    const set2 = new Set(arr2);
    return arr1.filter(item => set2.has(item));
}
/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
/**
 * Get the last N items from an array
 */
function takeRight(array, n = 1) {
    return array.slice(Math.max(0, array.length - n));
}


/***/ }),

/***/ "./src/async.ts":
/*!**********************!*\
  !*** ./src/async.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   delay: () => (/* binding */ delay),
/* harmony export */   memoize: () => (/* binding */ memoize),
/* harmony export */   pLimit: () => (/* binding */ pLimit),
/* harmony export */   retry: () => (/* binding */ retry),
/* harmony export */   throttle: () => (/* binding */ throttle),
/* harmony export */   timeout: () => (/* binding */ timeout)
/* harmony export */ });
/**
 * Async Utility Functions
 */
/**
 * Delay execution for specified milliseconds
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
async function retry(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 100, maxDelay = 5000, backoffFactor = 2 } = options;
    let lastError;
    let currentDelay = initialDelay;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries) {
                await delay(currentDelay);
                currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
            }
        }
    }
    throw lastError;
}
/**
 * Execute promises with concurrency limit
 */
async function pLimit(tasks, concurrency) {
    const results = [];
    const executing = [];
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const promise = Promise.resolve().then(async () => {
            results[i] = await task();
        });
        executing.push(promise);
        if (executing.length >= concurrency) {
            await Promise.race(executing);
            executing.splice(executing.findIndex(p => p === promise), 1);
        }
    }
    await Promise.all(executing);
    return results;
}
/**
 * Debounce a function
 */
function debounce(fn, wait) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, wait);
    };
}
/**
 * Throttle a function
 */
function throttle(fn, wait) {
    let lastTime = 0;
    let timeoutId;
    return function (...args) {
        const now = Date.now();
        const remaining = wait - (now - lastTime);
        if (remaining <= 0) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
            }
            lastTime = now;
            fn.apply(this, args);
        }
        else if (!timeoutId) {
            timeoutId = setTimeout(() => {
                lastTime = Date.now();
                timeoutId = undefined;
                fn.apply(this, args);
            }, remaining);
        }
    };
}
/**
 * Create a memoized version of a function
 */
function memoize(fn, keyResolver) {
    const cache = new Map();
    return function (...args) {
        const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}
/**
 * Timeout a promise
 */
async function timeout(promise, ms, errorMessage = 'Operation timed out') {
    return Promise.race([
        promise,
        delay(ms).then(() => {
            throw new Error(errorMessage);
        })
    ]);
}


/***/ }),

/***/ "./src/date.ts":
/*!*********************!*\
  !*** ./src/date.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addDays: () => (/* binding */ addDays),
/* harmony export */   addMonths: () => (/* binding */ addMonths),
/* harmony export */   diffInDays: () => (/* binding */ diffInDays),
/* harmony export */   endOfDay: () => (/* binding */ endOfDay),
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   isFuture: () => (/* binding */ isFuture),
/* harmony export */   isPast: () => (/* binding */ isPast),
/* harmony export */   isToday: () => (/* binding */ isToday),
/* harmony export */   relativeTime: () => (/* binding */ relativeTime),
/* harmony export */   startOfDay: () => (/* binding */ startOfDay)
/* harmony export */ });
/**
 * Date Utility Functions
 */
/**
 * Format a date using a simple format string
 * Supports: YYYY, MM, DD, HH, mm, ss
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    const pad = (n) => n.toString().padStart(2, '0');
    const replacements = {
        'YYYY': date.getFullYear().toString(),
        'MM': pad(date.getMonth() + 1),
        'DD': pad(date.getDate()),
        'HH': pad(date.getHours()),
        'mm': pad(date.getMinutes()),
        'ss': pad(date.getSeconds())
    };
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
}
/**
 * Add days to a date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * Add months to a date
 */
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
/**
 * Get difference between dates in days
 */
function diffInDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
}
/**
 * Check if a date is today
 */
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}
/**
 * Check if a date is in the past
 */
function isPast(date) {
    return date.getTime() < Date.now();
}
/**
 * Check if a date is in the future
 */
function isFuture(date) {
    return date.getTime() > Date.now();
}
/**
 * Get start of day
 */
function startOfDay(date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
}
/**
 * Get end of day
 */
function endOfDay(date) {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
}
/**
 * Get relative time string (e.g., "2 days ago")
 */
function relativeTime(date) {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0)
        return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}


/***/ }),

/***/ "./src/object.ts":
/*!***********************!*\
  !*** ./src/object.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deepClone: () => (/* binding */ deepClone),
/* harmony export */   deepMerge: () => (/* binding */ deepMerge),
/* harmony export */   get: () => (/* binding */ get),
/* harmony export */   isEmpty: () => (/* binding */ isEmpty),
/* harmony export */   omit: () => (/* binding */ omit),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   set: () => (/* binding */ set)
/* harmony export */ });
/**
 * Object Utility Functions
 */
/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    const cloned = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
/**
 * Deep merge objects
 */
function deepMerge(...objects) {
    const result = {};
    for (const obj of objects) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const existing = result[key];
                if (value && typeof value === 'object' && !Array.isArray(value) &&
                    existing && typeof existing === 'object' && !Array.isArray(existing)) {
                    result[key] = deepMerge(existing, value);
                }
                else {
                    result[key] = value;
                }
            }
        }
    }
    return result;
}
/**
 * Pick specific keys from an object
 */
function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key];
        }
    }
    return result;
}
/**
 * Omit specific keys from an object
 */
function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
/**
 * Check if an object is empty
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
/**
 * Get nested value from object using dot notation
 */
function get(obj, path, defaultValue) {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result === null || result === undefined) {
            return defaultValue;
        }
        result = result[key];
    }
    return (result === undefined ? defaultValue : result);
}
/**
 * Set nested value in object using dot notation
 */
function set(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[lastKey] = value;
    return obj;
}


/***/ }),

/***/ "./src/string.ts":
/*!***********************!*\
  !*** ./src/string.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   camelCase: () => (/* binding */ camelCase),
/* harmony export */   capitalize: () => (/* binding */ capitalize),
/* harmony export */   escapeHtml: () => (/* binding */ escapeHtml),
/* harmony export */   kebabCase: () => (/* binding */ kebabCase),
/* harmony export */   pad: () => (/* binding */ pad),
/* harmony export */   pascalCase: () => (/* binding */ pascalCase),
/* harmony export */   snakeCase: () => (/* binding */ snakeCase),
/* harmony export */   template: () => (/* binding */ template),
/* harmony export */   truncate: () => (/* binding */ truncate),
/* harmony export */   wordCount: () => (/* binding */ wordCount)
/* harmony export */ });
/**
 * String Utility Functions
 */
/**
 * Convert string to camelCase
 */
function camelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => index === 0 ? letter.toLowerCase() : letter.toUpperCase())
        .replace(/[\s\-_]+/g, '');
}
/**
 * Convert string to PascalCase
 */
function pascalCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
        .replace(/[\s\-_]+/g, '');
}
/**
 * Convert string to snake_case
 */
function snakeCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .toLowerCase();
}
/**
 * Convert string to kebab-case
 */
function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * Truncate string to specified length
 */
function truncate(str, length, suffix = '...') {
    if (str.length <= length)
        return str;
    return str.slice(0, length - suffix.length) + suffix;
}
/**
 * Pad string to specified length
 */
function pad(str, length, char = ' ', position = 'right') {
    const padLength = length - str.length;
    if (padLength <= 0)
        return str;
    const padding = char.repeat(Math.ceil(padLength / char.length));
    switch (position) {
        case 'left':
            return padding.slice(0, padLength) + str;
        case 'right':
            return str + padding.slice(0, padLength);
        case 'both':
            const leftPad = Math.floor(padLength / 2);
            const rightPad = padLength - leftPad;
            return padding.slice(0, leftPad) + str + padding.slice(0, rightPad);
    }
}
/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
}
/**
 * Simple template string replacement
 */
function template(str, data) {
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => { var _a; return String((_a = data[key]) !== null && _a !== void 0 ? _a : ''); });
}
/**
 * Count words in a string
 */
function wordCount(str) {
    const trimmed = str.trim();
    if (!trimmed)
        return 0;
    return trimmed.split(/\s+/).length;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUILD_DATE: () => (/* binding */ BUILD_DATE),
/* harmony export */   VERSION: () => (/* binding */ VERSION),
/* harmony export */   addDays: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.addDays),
/* harmony export */   addMonths: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.addMonths),
/* harmony export */   camelCase: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.camelCase),
/* harmony export */   capitalize: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.capitalize),
/* harmony export */   chunk: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.chunk),
/* harmony export */   debounce: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.debounce),
/* harmony export */   deepClone: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.deepClone),
/* harmony export */   deepMerge: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.deepMerge),
/* harmony export */   delay: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.delay),
/* harmony export */   diffInDays: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.diffInDays),
/* harmony export */   difference: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.difference),
/* harmony export */   endOfDay: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.endOfDay),
/* harmony export */   escapeHtml: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.escapeHtml),
/* harmony export */   flatten: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.flatten),
/* harmony export */   formatDate: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.formatDate),
/* harmony export */   get: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.get),
/* harmony export */   groupBy: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.groupBy),
/* harmony export */   intersection: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.intersection),
/* harmony export */   isEmpty: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.isEmpty),
/* harmony export */   isFuture: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.isFuture),
/* harmony export */   isPast: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.isPast),
/* harmony export */   isToday: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.isToday),
/* harmony export */   kebabCase: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.kebabCase),
/* harmony export */   memoize: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.memoize),
/* harmony export */   omit: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.omit),
/* harmony export */   pLimit: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.pLimit),
/* harmony export */   pad: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.pad),
/* harmony export */   pascalCase: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.pascalCase),
/* harmony export */   pick: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.pick),
/* harmony export */   relativeTime: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.relativeTime),
/* harmony export */   retry: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.retry),
/* harmony export */   set: () => (/* reexport safe */ _object__WEBPACK_IMPORTED_MODULE_1__.set),
/* harmony export */   shuffle: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.shuffle),
/* harmony export */   snakeCase: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.snakeCase),
/* harmony export */   startOfDay: () => (/* reexport safe */ _date__WEBPACK_IMPORTED_MODULE_3__.startOfDay),
/* harmony export */   takeRight: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.takeRight),
/* harmony export */   template: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.template),
/* harmony export */   throttle: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.throttle),
/* harmony export */   timeout: () => (/* reexport safe */ _async__WEBPACK_IMPORTED_MODULE_4__.timeout),
/* harmony export */   truncate: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.truncate),
/* harmony export */   unique: () => (/* reexport safe */ _array__WEBPACK_IMPORTED_MODULE_0__.unique),
/* harmony export */   wordCount: () => (/* reexport safe */ _string__WEBPACK_IMPORTED_MODULE_2__.wordCount)
/* harmony export */ });
/* harmony import */ var _array__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./array */ "./src/array.ts");
/* harmony import */ var _object__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./object */ "./src/object.ts");
/* harmony import */ var _string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./string */ "./src/string.ts");
/* harmony import */ var _date__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./date */ "./src/date.ts");
/* harmony import */ var _async__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./async */ "./src/async.ts");
/**
 * Utils Library - Entry Point
 *
 * A collection of utility functions demonstrating TypeScript + Webpack bundling.
 */
// Array utilities

// Object utilities

// String utilities

// Date utilities

// Async utilities

// Version info
const VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString();

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});