/**
 * cache/LRUCache.js
 *
 * Least Recently Used (LRU) cache implementation using JavaScript's Map.
 * Map preserves insertion order, allowing O(1) lookup, insertion,
 * and eviction of the least recently used entry.
 */

class LRUCache {
    constructor(capacity = 8) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    /**
     * Retrieves an item from the cache.
     * If found, the item becomes the most recently used.
     *
     * @param {string} key
     * @returns {*|null}
     */
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const value = this.cache.get(key);

        // Refresh insertion order
        this.cache.delete(key);
        this.cache.set(key, value);

        return value;
    }

    /**
     * Stores an item in the cache.
     * If the cache exceeds capacity,
     * the least recently used item is removed.
     *
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {

        if (this.cache.has(key)) {
            this.cache.delete(key);
        }

        this.cache.set(key, value);

        if (this.cache.size > this.capacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Clears the cache.
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Returns the current cache size.
     */
    size() {
        return this.cache.size;
    }
}

module.exports = LRUCache;