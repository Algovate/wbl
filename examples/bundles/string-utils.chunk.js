(window.webpackJsonp = window.webpackJsonp || []).push([["string-utils"], {
    /**
     * Module: stringUtils
     * String manipulation utilities
     */
    "stringUtils": function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);

        __webpack_require__.d(__webpack_exports__, "capitalize", function () { return capitalize; });
        __webpack_require__.d(__webpack_exports__, "camelCase", function () { return camelCase; });
        __webpack_require__.d(__webpack_exports__, "snakeCase", function () { return snakeCase; });
        __webpack_require__.d(__webpack_exports__, "kebabCase", function () { return kebabCase; });
        __webpack_require__.d(__webpack_exports__, "truncate", function () { return truncate; });
        __webpack_require__.d(__webpack_exports__, "pad", function () { return pad; });
        __webpack_require__.d(__webpack_exports__, "reverse", function () { return reverse; });
        __webpack_require__.d(__webpack_exports__, "wordCount", function () { return wordCount; });

        function capitalize(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        function camelCase(str) {
            return str
                .replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
                    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
                })
                .replace(/\s+|-|_/g, '');
        }

        function snakeCase(str) {
            return str
                .replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map(function (word) { return word.toLowerCase(); })
                .join('_');
        }

        function kebabCase(str) {
            return str
                .replace(/\W+/g, ' ')
                .split(/ |\B(?=[A-Z])/)
                .map(function (word) { return word.toLowerCase(); })
                .join('-');
        }

        function truncate(str, length, suffix) {
            suffix = suffix === undefined ? '...' : suffix;
            if (!str || str.length <= length) return str;
            return str.slice(0, length - suffix.length) + suffix;
        }

        function pad(str, length, char, direction) {
            char = char === undefined ? ' ' : char;
            direction = direction === undefined ? 'right' : direction;
            str = String(str);
            if (str.length >= length) return str;
            var padding = char.repeat(length - str.length);
            return direction === 'left' ? padding + str : str + padding;
        }

        function reverse(str) {
            return str.split('').reverse().join('');
        }

        function wordCount(str) {
            if (!str || !str.trim()) return 0;
            return str.trim().split(/\s+/).length;
        }
    },

    /**
     * Module: stringValidator
     * String validation utilities
     */
    "stringValidator": function (module, __webpack_exports__, __webpack_require__) {
        "use strict";
        __webpack_require__.r(__webpack_exports__);

        __webpack_require__.d(__webpack_exports__, "isEmail", function () { return isEmail; });
        __webpack_require__.d(__webpack_exports__, "isURL", function () { return isURL; });
        __webpack_require__.d(__webpack_exports__, "isAlphanumeric", function () { return isAlphanumeric; });
        __webpack_require__.d(__webpack_exports__, "isEmpty", function () { return isEmpty; });
        __webpack_require__.d(__webpack_exports__, "isNumeric", function () { return isNumeric; });
        __webpack_require__.d(__webpack_exports__, "hasMinLength", function () { return hasMinLength; });
        __webpack_require__.d(__webpack_exports__, "hasMaxLength", function () { return hasMaxLength; });

        var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        var ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;
        var NUMERIC_REGEX = /^-?\d*\.?\d+$/;

        function isEmail(str) {
            return EMAIL_REGEX.test(str);
        }

        function isURL(str) {
            return URL_REGEX.test(str);
        }

        function isAlphanumeric(str) {
            return ALPHANUMERIC_REGEX.test(str);
        }

        function isEmpty(str) {
            return !str || str.trim().length === 0;
        }

        function isNumeric(str) {
            return NUMERIC_REGEX.test(str);
        }

        function hasMinLength(str, minLen) {
            return str && str.length >= minLen;
        }

        function hasMaxLength(str, maxLen) {
            return !str || str.length <= maxLen;
        }
    }
}]);
