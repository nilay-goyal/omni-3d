// Lightweight cache module for listings search/results
// Uses Redis (Upstash) if available, otherwise falls back to in-memory LRU

// import type { Listing } from '../pages/Marketplace'; // Not needed for cache module

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Simple LRU cache fallback
class LRUCache {
  private cache = new Map<string, any>();
  private order: string[] = [];
  constructor(private maxSize = 1000) {}
  get(key: string) {
    if (!this.cache.has(key)) return undefined;
    // Move key to end
    this.order = this.order.filter(k => k !== key);
    this.order.push(key);
    return this.cache.get(key);
  }
  set(key: string, value: any, ttlSeconds?: number) {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.order.shift();
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, value);
    this.order.push(key);
    if (ttlSeconds) {
      setTimeout(() => {
        this.cache.delete(key);
        this.order = this.order.filter(k => k !== key);
      }, ttlSeconds * 1000);
    }
  }
  mget(keys: string[]) {
    return keys.map(k => this.get(k));
  }
}

const lru = new LRUCache();

async function redisFetch(method: string, key: string, value?: any, ttl?: number) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  const url = `${REDIS_URL}/${method}/${encodeURIComponent(key)}`;
  const headers = { Authorization: `Bearer ${REDIS_TOKEN}` };
  if (method === 'get') {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.json();
  } else if (method === 'set') {
    const body = JSON.stringify({ value, ttl });
    const res = await fetch(url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body });
    return res.ok;
  } else if (method === 'mget') {
  const res = await fetch(`${REDIS_URL}/mget`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: value }) });
    if (!res.ok) return null;
    return await res.json();
  }
  return null;
}

export const cache = {
  async get(key: string) {
    const redisVal = await redisFetch('get', key);
    if (redisVal !== null) return redisVal;
    return lru.get(key);
  },
  async set(key: string, value: any, ttlSeconds?: number) {
    await redisFetch('set', key, value, ttlSeconds);
    lru.set(key, value, ttlSeconds);
  },
  async mget(keys: string[]) {
    const redisVals = await redisFetch('mget', '', keys);
    if (redisVals !== null) return redisVals;
    return lru.mget(keys);
  }
};

// Example cache keys:
// list:city:{cityId}:q:{hash(filters)} → string[] of listing IDs (TTL 180s)
// listing:{id} → JSON blob (TTL 24h)
// user:{id}:recentFilters → JSON
