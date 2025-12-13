/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/EventEmitter.js":
/*!*****************************!*\
  !*** ./src/EventEmitter.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventEmitter: () => (/* binding */ EventEmitter),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * EventEmitter - A simple event emitter implementation
 */
class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    on(event, listener) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        this._events.get(event).push(listener);
        return this;
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };
        onceWrapper.originalListener = listener;
        return this.on(event, onceWrapper);
    }

    off(event, listener) {
        if (!this._events.has(event)) return this;

        if (!listener) {
            this._events.delete(event);
        } else {
            const listeners = this._events.get(event);
            const index = listeners.findIndex(
                l => l === listener || l.originalListener === listener
            );
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            if (listeners.length === 0) {
                this._events.delete(event);
            }
        }
        return this;
    }

    emit(event, ...args) {
        if (!this._events.has(event)) return false;

        const listeners = [...this._events.get(event)];
        for (const listener of listeners) {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        }
        return true;
    }

    listenerCount(event) {
        return this._events.has(event) ? this._events.get(event).length : 0;
    }

    eventNames() {
        return [...this._events.keys()];
    }

    removeAllListeners(event) {
        if (event) {
            this._events.delete(event);
        } else {
            this._events.clear();
        }
        return this;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (EventEmitter);


/***/ }),

/***/ "./src/Store.js":
/*!**********************!*\
  !*** ./src/Store.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Store: () => (/* binding */ Store),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventEmitter */ "./src/EventEmitter.js");
/**
 * Store - A simple in-memory store with persistence support
 */


class Store extends _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    constructor(initialState = {}) {
        super();
        this._data = new Map(Object.entries(initialState));
        this._history = [];
        this._maxHistory = 100;
    }

    get(key) {
        return this._data.get(key);
    }

    set(key, value) {
        const oldValue = this._data.get(key);
        this._data.set(key, value);

        this._addToHistory({
            type: 'set',
            key,
            oldValue,
            newValue: value,
            timestamp: Date.now()
        });

        this.emit('change', { key, oldValue, newValue: value });
        return this;
    }

    delete(key) {
        const oldValue = this._data.get(key);
        const result = this._data.delete(key);

        if (result) {
            this._addToHistory({
                type: 'delete',
                key,
                oldValue,
                timestamp: Date.now()
            });
            this.emit('delete', { key, oldValue });
        }

        return result;
    }

    has(key) {
        return this._data.has(key);
    }

    clear() {
        const oldData = Object.fromEntries(this._data);
        this._data.clear();

        this._addToHistory({
            type: 'clear',
            oldData,
            timestamp: Date.now()
        });

        this.emit('clear', { oldData });
        return this;
    }

    get size() {
        return this._data.size;
    }

    keys() {
        return [...this._data.keys()];
    }

    values() {
        return [...this._data.values()];
    }

    entries() {
        return [...this._data.entries()];
    }

    toJSON() {
        return Object.fromEntries(this._data);
    }

    fromJSON(json) {
        this._data = new Map(Object.entries(json));
        this.emit('load', { data: json });
        return this;
    }

    getHistory(limit = 10) {
        return this._history.slice(-limit);
    }

    _addToHistory(entry) {
        this._history.push(entry);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }

    find(predicate) {
        for (const [key, value] of this._data) {
            if (predicate(value, key)) {
                return value;
            }
        }
        return undefined;
    }

    filter(predicate) {
        const results = [];
        for (const [key, value] of this._data) {
            if (predicate(value, key)) {
                results.push(value);
            }
        }
        return results;
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Store);


/***/ }),

/***/ "./src/models/Cart.js":
/*!****************************!*\
  !*** ./src/models/Cart.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Cart: () => (/* binding */ Cart),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../EventEmitter */ "./src/EventEmitter.js");
/**
 * Cart Model
 */


class Cart extends _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    constructor(userId) {
        super();
        this.userId = userId;
        this.items = new Map();
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    get itemCount() {
        let count = 0;
        for (const quantity of this.items.values()) {
            count += quantity;
        }
        return count;
    }

    get isEmpty() {
        return this.items.size === 0;
    }

    addItem(product, quantity = 1) {
        const currentQuantity = this.items.get(product.id) || 0;
        const newQuantity = currentQuantity + quantity;

        this.items.set(product.id, newQuantity);
        this.updatedAt = new Date();

        this.emit('itemAdded', {
            product,
            quantity,
            totalQuantity: newQuantity
        });

        return this;
    }

    removeItem(productId, quantity = null) {
        if (!this.items.has(productId)) return this;

        const currentQuantity = this.items.get(productId);

        if (quantity === null || quantity >= currentQuantity) {
            this.items.delete(productId);
            this.emit('itemRemoved', { productId, removedQuantity: currentQuantity });
        } else {
            const newQuantity = currentQuantity - quantity;
            this.items.set(productId, newQuantity);
            this.emit('itemQuantityChanged', {
                productId,
                oldQuantity: currentQuantity,
                newQuantity
            });
        }

        this.updatedAt = new Date();
        return this;
    }

    getQuantity(productId) {
        return this.items.get(productId) || 0;
    }

    setQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeItem(productId);
        }

        const oldQuantity = this.items.get(productId) || 0;
        this.items.set(productId, quantity);
        this.updatedAt = new Date();

        this.emit('itemQuantityChanged', {
            productId,
            oldQuantity,
            newQuantity: quantity
        });

        return this;
    }

    clear() {
        const itemCount = this.items.size;
        this.items.clear();
        this.updatedAt = new Date();

        this.emit('cleared', { itemCount });
        return this;
    }

    calculateTotal(products) {
        let total = 0;

        for (const [productId, quantity] of this.items) {
            const product = products.find(p => p.id === productId);
            if (product) {
                total += product.price * quantity;
            }
        }

        return total;
    }

    getItems() {
        return [...this.items.entries()].map(([productId, quantity]) => ({
            productId,
            quantity
        }));
    }

    toJSON() {
        return {
            userId: this.userId,
            items: this.getItems(),
            itemCount: this.itemCount,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString()
        };
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Cart);


/***/ }),

/***/ "./src/models/Product.js":
/*!*******************************!*\
  !*** ./src/models/Product.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Product: () => (/* binding */ Product),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../EventEmitter */ "./src/EventEmitter.js");
/**
 * Product Model
 */


let productIdCounter = 1;

class Product extends _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    constructor(data = {}) {
        super();
        this.id = data.id || productIdCounter++;
        this.name = data.name || 'Unnamed Product';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.stock = data.stock || 0;
        this.category = data.category || 'uncategorized';
        this.tags = data.tags || [];
        this.createdAt = data.createdAt || new Date();
    }

    get isAvailable() {
        return this.stock > 0;
    }

    get formattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }

    updateStock(quantity) {
        const oldStock = this.stock;
        this.stock = Math.max(0, this.stock + quantity);

        this.emit('stockChange', {
            oldStock,
            newStock: this.stock,
            change: quantity
        });

        if (oldStock > 0 && this.stock === 0) {
            this.emit('outOfStock', this);
        }

        return this;
    }

    setPrice(newPrice) {
        const oldPrice = this.price;
        this.price = Math.max(0, newPrice);

        this.emit('priceChange', {
            oldPrice,
            newPrice: this.price
        });

        return this;
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.emit('tagAdded', { tag });
        }
        return this;
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index !== -1) {
            this.tags.splice(index, 1);
            this.emit('tagRemoved', { tag });
        }
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            stock: this.stock,
            category: this.category,
            tags: [...this.tags],
            createdAt: this.createdAt.toISOString(),
            isAvailable: this.isAvailable,
            formattedPrice: this.formattedPrice
        };
    }

    static fromJSON(json) {
        return new Product({
            ...json,
            createdAt: new Date(json.createdAt)
        });
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Product);


/***/ }),

/***/ "./src/models/User.js":
/*!****************************!*\
  !*** ./src/models/User.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   User: () => (/* binding */ User),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../EventEmitter */ "./src/EventEmitter.js");
/**
 * User Model
 */


let userIdCounter = 1;

class User extends _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    constructor(data = {}) {
        super();
        this.id = data.id || userIdCounter++;
        this.name = data.name || 'Anonymous';
        this.email = data.email || '';
        this.role = data.role || 'user';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = new Date();
        this._settings = data.settings || {};
    }

    get isAdmin() {
        return this.role === 'admin';
    }

    get displayName() {
        return this.name || this.email.split('@')[0] || `User ${this.id}`;
    }

    update(data) {
        const oldData = this.toJSON();

        if (data.name !== undefined) this.name = data.name;
        if (data.email !== undefined) this.email = data.email;
        if (data.role !== undefined) this.role = data.role;
        if (data.settings !== undefined) {
            this._settings = { ...this._settings, ...data.settings };
        }

        this.updatedAt = new Date();
        this.emit('update', { oldData, newData: this.toJSON() });
        return this;
    }

    getSetting(key, defaultValue) {
        return this._settings[key] !== undefined ? this._settings[key] : defaultValue;
    }

    setSetting(key, value) {
        this._settings[key] = value;
        this.emit('settingChange', { key, value });
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            settings: { ...this._settings }
        };
    }

    static fromJSON(json) {
        return new User({
            ...json,
            createdAt: new Date(json.createdAt),
            updatedAt: new Date(json.updatedAt)
        });
    }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (User);


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
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   App: () => (/* binding */ App),
/* harmony export */   Cart: () => (/* reexport safe */ _models_Cart__WEBPACK_IMPORTED_MODULE_4__.Cart),
/* harmony export */   EventEmitter: () => (/* reexport safe */ _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter),
/* harmony export */   Product: () => (/* reexport safe */ _models_Product__WEBPACK_IMPORTED_MODULE_3__.Product),
/* harmony export */   Store: () => (/* reexport safe */ _Store__WEBPACK_IMPORTED_MODULE_1__.Store),
/* harmony export */   User: () => (/* reexport safe */ _models_User__WEBPACK_IMPORTED_MODULE_2__.User),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventEmitter */ "./src/EventEmitter.js");
/* harmony import */ var _Store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Store */ "./src/Store.js");
/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./models/User */ "./src/models/User.js");
/* harmony import */ var _models_Product__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./models/Product */ "./src/models/Product.js");
/* harmony import */ var _models_Cart__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./models/Cart */ "./src/models/Cart.js");
/**
 * Class App - Entry Point
 * 
 * Demonstrates ES6 classes, inheritance, and module patterns.
 */







// Re-export all classes


// Create a simple application facade
class App extends _EventEmitter__WEBPACK_IMPORTED_MODULE_0__.EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            name: 'ClassApp',
            version: '1.0.0',
            ...config
        };
        this.store = new _Store__WEBPACK_IMPORTED_MODULE_1__.Store();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        this.emit('beforeInit', this);

        // Simulate async initialization
        await new Promise(resolve => setTimeout(resolve, 10));

        this.initialized = true;
        this.emit('afterInit', this);

        return this;
    }

    createUser(data) {
        const user = new _models_User__WEBPACK_IMPORTED_MODULE_2__.User(data);
        this.store.set(`user:${user.id}`, user);
        this.emit('userCreated', user);
        return user;
    }

    createProduct(data) {
        const product = new _models_Product__WEBPACK_IMPORTED_MODULE_3__.Product(data);
        this.store.set(`product:${product.id}`, product);
        this.emit('productCreated', product);
        return product;
    }

    createCart(userId) {
        const cart = new _models_Cart__WEBPACK_IMPORTED_MODULE_4__.Cart(userId);
        this.store.set(`cart:${userId}`, cart);
        this.emit('cartCreated', cart);
        return cart;
    }

    getInfo() {
        return {
            ...this.config,
            initialized: this.initialized,
            storeSize: this.store.size
        };
    }
}

// Default export
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

})();

/******/ })()
;