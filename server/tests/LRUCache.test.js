/**
 * tests/LRUCache.test.js — Unit tests for LRU cache data structure
 * Verifies insertion, retrieval, eviction order, and cache clearing behavior.
 * The cache uses JavaScript Map insertion ordering to implement
 * least recently used eviction.
 */

// Mock console.log before requiring the app
jest.spyOn(console, 'log').mockImplementation(() => { });

const LRUCache = require('../cache/LRUCache');

// *** LRU Cache Operations ***

describe('LRUCache', () => {

    test('stores and retrieves cached values', () => {

        const cache = new LRUCache(3);

        cache.set('animal-page-1', {
            total: 10
        });

        const result = cache.get('animal-page-1');

        expect(result.total).toBe(10);
        expect(cache.size()).toBe(1);
    });


    test('returns null when requested key does not exist', () => {

        const cache = new LRUCache(3);

        const result = cache.get('missing-key');

        expect(result).toBeNull();
    });


    test('updates existing key and refreshes usage order', () => {

        const cache = new LRUCache(2);

        cache.set('A', 1);
        cache.set('B', 2);

        // Access A so it becomes most recently used
        cache.get('A');

        // Adding C should remove B
        cache.set('C', 3);

        expect(cache.get('A')).toBe(1);
        expect(cache.get('B')).toBeNull();
        expect(cache.get('C')).toBe(3);
    });


    test('evicts least recently used item when capacity is exceeded', () => {

        const cache = new LRUCache(2);

        cache.set('first', 1);
        cache.set('second', 2);
        cache.set('third', 3);

        expect(cache.size()).toBe(2);
        expect(cache.get('first')).toBeNull();
        expect(cache.get('second')).toBe(2);
        expect(cache.get('third')).toBe(3);
    });


    test('clears all cached values', () => {

        const cache = new LRUCache(3);

        cache.set('A', 1);
        cache.set('B', 2);

        cache.clear();

        expect(cache.size()).toBe(0);
        expect(cache.get('A')).toBeNull();
        expect(cache.get('B')).toBeNull();
    });

});