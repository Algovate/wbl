/**
 * Store - A simple in-memory store with persistence support
 */
import { EventEmitter } from './EventEmitter';

export class Store extends EventEmitter {
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

export default Store;
