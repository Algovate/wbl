/**
 * Product Model
 */
import { EventEmitter } from '../EventEmitter';

let productIdCounter = 1;

export class Product extends EventEmitter {
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

export default Product;
