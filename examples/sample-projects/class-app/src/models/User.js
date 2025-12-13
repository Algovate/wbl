/**
 * User Model
 */
import { EventEmitter } from '../EventEmitter';

let userIdCounter = 1;

export class User extends EventEmitter {
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

export default User;
