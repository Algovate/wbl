(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["SourceMapDemo"] = factory();
	else
		root["SourceMapDemo"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api.ts":
/*!********************!*\
  !*** ./src/api.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchUser: () => (/* binding */ fetchUser),
/* harmony export */   formatUserName: () => (/* binding */ formatUserName),
/* harmony export */   validateEmail: () => (/* binding */ validateEmail)
/* harmony export */ });
/**
 * Simple API module for source map demo
 */
/**
 * Fetch user data from API
 */
async function fetchUser(userId) {
    // Simulated API call
    const user = {
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`
    };
    return {
        success: true,
        data: user
    };
}
/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Format user display name
 */
function formatUserName(user) {
    return `${user.name} <${user.email}>`;
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debounce: () => (/* binding */ debounce),
/* harmony export */   deepClone: () => (/* binding */ deepClone),
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   truncate: () => (/* binding */ truncate)
/* harmony export */ });
/**
 * Utility functions for source map demo
 */
/**
 * Format a date to ISO string
 */
function formatDate(date) {
    return date.toISOString();
}
/**
 * Truncate a string with ellipsis
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.substring(0, maxLength - 3) + '...';
}
/**
 * Deep clone an object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Debounce a function
 */
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
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
/* harmony export */   debounce: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.debounce),
/* harmony export */   deepClone: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.deepClone),
/* harmony export */   fetchUser: () => (/* reexport safe */ _api__WEBPACK_IMPORTED_MODULE_0__.fetchUser),
/* harmony export */   formatDate: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.formatDate),
/* harmony export */   formatUserName: () => (/* reexport safe */ _api__WEBPACK_IMPORTED_MODULE_0__.formatUserName),
/* harmony export */   truncate: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_1__.truncate),
/* harmony export */   validateEmail: () => (/* reexport safe */ _api__WEBPACK_IMPORTED_MODULE_0__.validateEmail)
/* harmony export */ });
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api */ "./src/api.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/**
 * Source Map Demo - Main entry point
 *
 * This module is built with source maps to demonstrate
 * WBL's source map resolution capabilities.
 */


// Version info
const VERSION = '1.0.0';
const BUILD_DATE = new Date().toISOString();

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=sourcemap-demo.js.map