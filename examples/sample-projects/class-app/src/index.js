/**
 * Class App - Entry Point
 * 
 * Demonstrates ES6 classes, inheritance, and module patterns.
 */

import { EventEmitter } from './EventEmitter';
import { Store } from './Store';
import { User } from './models/User';
import { Product } from './models/Product';
import { Cart } from './models/Cart';

// Re-export all classes
export { EventEmitter, Store, User, Product, Cart };

// Create a simple application facade
export class App extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            name: 'ClassApp',
            version: '1.0.0',
            ...config
        };
        this.store = new Store();
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
        const user = new User(data);
        this.store.set(`user:${user.id}`, user);
        this.emit('userCreated', user);
        return user;
    }

    createProduct(data) {
        const product = new Product(data);
        this.store.set(`product:${product.id}`, product);
        this.emit('productCreated', product);
        return product;
    }

    createCart(userId) {
        const cart = new Cart(userId);
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
export default App;
