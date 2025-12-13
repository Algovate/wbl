/**
 * EventEmitter - A simple event emitter implementation
 */
export class EventEmitter {
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

export default EventEmitter;
