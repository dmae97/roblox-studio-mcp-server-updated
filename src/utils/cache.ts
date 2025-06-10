import NodeCache from 'node-cache';
import { logger } from './logger.js';

/**
 * Cache utility for Roblox Studio MCP Server
 * 
 * Provides simple caching functionality with TTL (Time-To-Live)
 */

// Get cache configuration from environment variables
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '3600', 10); // Default: 1 hour
const CACHE_CHECK_PERIOD = parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10); // Default: 10 minutes

// Create cache instance
const cacheInstance = new NodeCache({
  stdTTL: CACHE_TTL, 
  checkperiod: CACHE_CHECK_PERIOD,
  useClones: false, // For performance
});

// Log cache events
cacheInstance.on('expired', (key, _value) => {
  logger.debug(`Cache item expired: ${key}`);
});

cacheInstance.on('flush', () => {
  logger.debug('Cache flushed');
});

cacheInstance.on('set', (key) => {
  logger.debug(`Cache item set: ${key}`);
});

cacheInstance.on('del', (key) => {
  logger.debug(`Cache item deleted: ${key}`);
});

/**
 * Cache utility with simpler interface
 */
export const cache = {
  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found
   */
  get<T>(key: string): T | undefined {
    return cacheInstance.get<T>(key);
  },
  
  /**
   * Set an item in the cache
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Optional TTL in seconds (overrides default)
   * @returns True if the item was set successfully
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return cacheInstance.set(key, value, ttl || 0);
  },
  
  /**
   * Delete an item from the cache
   * @param key The cache key
   * @returns True if the item was deleted successfully
   */
  delete(key: string): boolean {
    return cacheInstance.del(key) > 0;
  },
  
  /**
   * Check if a key exists in the cache
   * @param key The cache key
   * @returns True if the key exists
   */
  has(key: string): boolean {
    return cacheInstance.has(key);
  },
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    cacheInstance.flushAll();
  },
  
  /**
   * Get statistics about the cache
   * @returns Cache statistics
   */
  stats(): {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
    } {
    return cacheInstance.getStats();
  },
  
  /**
   * Get all keys in the cache
   * @returns Array of keys
   */
  keys(): string[] {
    return cacheInstance.keys();
  },
  
  /**
   * Get the TTL of a key
   * @param key The cache key
   * @returns TTL in seconds or undefined if not found
   */
  getTtl(key: string): number | undefined {
    return cacheInstance.getTtl(key);
  },
  
  /**
   * Get or set cache value with function
   * @param key The cache key
   * @param fn Function to produce value if not in cache
   * @param ttl Optional TTL in seconds
   * @returns The cached or computed value
   */
  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cachedValue = this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    try {
      const value = await fn();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      logger.error(`Error computing cached value for key: ${key}`, error);
      throw error;
    }
  },
};
