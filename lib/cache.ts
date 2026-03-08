// Simple in-memory cache for API responses
// In production, consider using Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate all keys matching a pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

// Export singleton instance
export const cache = new Cache();

// Cache key generators
export const cacheKeys = {
  club: (id: string | number) => `club:${id}`,
  clubs: () => 'clubs:all',
  clubHierarchy: (id: string | number) => `club:${id}:hierarchy`,
  player: (id: string | number) => `player:${id}`,
  playersByClub: (clubId: string | number, role?: string) =>
    `players:club:${clubId}${role ? `:role:${role}` : ''}`,
  playersByRole: (clubId: string | number, role: string) =>
    `players:club:${clubId}:role:${role}`,
};

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  short: 30000, // 30 seconds
  medium: 60000, // 1 minute
  long: 300000, // 5 minutes
  veryLong: 600000, // 10 minutes
};
