/**
 * Request deduplication and caching utilities
 * Prevents duplicate API calls and caches responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data or fetch if not available
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Check if data is in cache and not expired
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending;
    }

    // Make new request
    const request = fetcher()
      .then((data) => {
        // Cache the result
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          expiresAt: Date.now() + ttl,
        });

        // Remove from pending
        this.pendingRequests.delete(key);

        return data;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store pending request
    this.pendingRequests.set(key, request);

    return request;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: RegExp) {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        expiresIn: entry.expiresAt - Date.now(),
      })),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));

    return keysToDelete.length;
  }
}

// Global cache instance
export const requestCache = new RequestCache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    const cleaned = requestCache.cleanup();
    if (process.env.NODE_ENV === 'development' && cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Fetch with automatic caching and deduplication
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & { ttl?: number }
): Promise<T> {
  const { ttl, ...fetchOptions } = options || {};
  
  return requestCache.get(
    url,
    async () => {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    ttl
  );
}

/**
 * Prefetch data for faster navigation
 */
export function prefetchData(url: string, ttl?: number) {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback if available
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      cachedFetch(url, { ttl }).catch(() => {
        // Silently fail prefetch
      });
    });
  } else {
    setTimeout(() => {
      cachedFetch(url, { ttl }).catch(() => {
        // Silently fail prefetch
      });
    }, 1);
  }
}

/**
 * Batch multiple requests
 */
export async function batchFetch<T>(
  urls: string[],
  options?: RequestInit & { ttl?: number }
): Promise<T[]> {
  return Promise.all(
    urls.map((url) => cachedFetch<T>(url, options))
  );
}
