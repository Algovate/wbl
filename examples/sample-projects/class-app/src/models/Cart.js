/**
 * Cart Model
 */
import { EventEmitter } from '../EventEmitter';

export class Cart extends EventEmitter {
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

export default Cart;
