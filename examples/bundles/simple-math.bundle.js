/**
 * Simple Math Bundle - Webpack Main Bundle Format
 * 
 * A minimal webpack bundle containing math utility modules.
 * This demonstrates the main bundle format used by webpack.
 */
!function (modules) {
    // The module cache
    var installedModules = {};

    // The require function
    function __webpack_require__(moduleId) {
        // Check if module is in cache
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }
        // Create a new module (and put it into the cache)
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: false,
            exports: {}
        };
        // Execute the module function
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        // Flag the module as loaded
        module.l = true;
        // Return the exports of the module
        return module.exports;
    }

    // expose the modules object (__webpack_modules__)
    __webpack_require__.m = modules;
    // expose the module cache
    __webpack_require__.c = installedModules;
    // define getter function for harmony exports
    __webpack_require__.d = function (exports, name, getter) {
        if (!__webpack_require__.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };
    // define __esModule on exports
    __webpack_require__.r = function (exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };
    // Object.prototype.hasOwnProperty.call
    __webpack_require__.o = function (object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };
    // __webpack_public_path__
    __webpack_require__.p = "";

    // Load entry module and return exports
    return __webpack_require__(__webpack_require__.s = "main");
}({
    /**
     * Module: main (Entry Point)
     * Exports the main API
     */
    "main": function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);

        var _calculator__ = __webpack_require__("calculator");
        var _utils__ = __webpack_require__("utils");

        __webpack_require__.d(__webpack_exports__, "Calculator", function () { return _calculator__.Calculator; });
        __webpack_require__.d(__webpack_exports__, "add", function () { return _calculator__.add; });
        __webpack_require__.d(__webpack_exports__, "subtract", function () { return _calculator__.subtract; });
        __webpack_require__.d(__webpack_exports__, "multiply", function () { return _calculator__.multiply; });
        __webpack_require__.d(__webpack_exports__, "divide", function () { return _calculator__.divide; });
        __webpack_require__.d(__webpack_exports__, "formatNumber", function () { return _utils__.formatNumber; });
        __webpack_require__.d(__webpack_exports__, "round", function () { return _utils__.round; });
        __webpack_require__.d(__webpack_exports__, "VERSION", function () { return VERSION; });

        var VERSION = "1.0.0";
    },

    /**
     * Module: calculator
     * Basic arithmetic operations
     */
    "calculator": function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);

        __webpack_require__.d(__webpack_exports__, "add", function () { return add; });
        __webpack_require__.d(__webpack_exports__, "subtract", function () { return subtract; });
        __webpack_require__.d(__webpack_exports__, "multiply", function () { return multiply; });
        __webpack_require__.d(__webpack_exports__, "divide", function () { return divide; });
        __webpack_require__.d(__webpack_exports__, "Calculator", function () { return Calculator; });

        function add(a, b) {
            return a + b;
        }

        function subtract(a, b) {
            return a - b;
        }

        function multiply(a, b) {
            return a * b;
        }

        function divide(a, b) {
            if (b === 0) throw new Error("Division by zero");
            return a / b;
        }

        // Calculator class
        var Calculator = (function () {
            function Calculator(initialValue) {
                this.value = initialValue || 0;
                this.history = [];
            }

            Calculator.prototype.add = function (n) {
                this.history.push({ op: 'add', arg: n, prev: this.value });
                this.value = add(this.value, n);
                return this;
            };

            Calculator.prototype.subtract = function (n) {
                this.history.push({ op: 'subtract', arg: n, prev: this.value });
                this.value = subtract(this.value, n);
                return this;
            };

            Calculator.prototype.multiply = function (n) {
                this.history.push({ op: 'multiply', arg: n, prev: this.value });
                this.value = multiply(this.value, n);
                return this;
            };

            Calculator.prototype.divide = function (n) {
                this.history.push({ op: 'divide', arg: n, prev: this.value });
                this.value = divide(this.value, n);
                return this;
            };

            Calculator.prototype.getResult = function () {
                return this.value;
            };

            Calculator.prototype.getHistory = function () {
                return this.history.slice();
            };

            Calculator.prototype.reset = function () {
                this.value = 0;
                this.history = [];
                return this;
            };

            return Calculator;
        })();
    },

    /**
     * Module: utils
     * Utility functions for number formatting
     */
    "utils": function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);

        __webpack_require__.d(__webpack_exports__, "formatNumber", function () { return formatNumber; });
        __webpack_require__.d(__webpack_exports__, "round", function () { return round; });
        __webpack_require__.d(__webpack_exports__, "clamp", function () { return clamp; });

        function formatNumber(num, decimals) {
            decimals = decimals === undefined ? 2 : decimals;
            return num.toFixed(decimals);
        }

        function round(num, precision) {
            precision = precision === undefined ? 0 : precision;
            var multiplier = Math.pow(10, precision);
            return Math.round(num * multiplier) / multiplier;
        }

        function clamp(num, min, max) {
            return Math.min(Math.max(num, min), max);
        }
    }
});
