/**
 * Tiny in-memory TTL cache for {@link ApiClient} GET responses.
 *
 * Intentionally process-local and non-persistent: it exists to skip identical
 * GETs within a short window (e.g. rapid remounts), not to replace TanStack
 * Query or server cache headers.
 *
 * ## When NOT to use caching (`cacheTtlMs`)
 *
 * - Frequently changing data (dashboards, live rates, inventory) — stale reads
 *   are worse than an extra round-trip.
 * - User-specific or permission-sensitive payloads — another user/session in
 *   the same SPA tab could theoretically share the in-memory map.
 * - After mutations that invalidate list/detail views — this cache has no
 *   tag-based invalidation; prefer TanStack Query for that.
 * - Large payloads — every entry stays in heap until TTL expiry.
 *
 * Prefer omitting `cacheTtlMs` unless you have a measured hot-spot and a
 * known staleness budget.
 */

interface CacheEntry {
  /** Epoch ms after which the entry must not be served. */
  expiresAt: number;
  /** Normalized or raw value stored for the request key. */
  value: unknown;
}

/**
 * Key/value store with per-entry TTL eviction on read.
 */
export class HttpResponseCache {
  private readonly store = new Map<string, CacheEntry>();

  /**
   * Returns a cached value when present and not expired.
   *
   * @param key - Stable request identity (method + URL + relevant params).
   * @returns The stored value, or `null` on miss / expiry.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /**
   * Stores a value until `ttlMs` elapses.
   *
   * @param key - Stable request identity.
   * @param value - Value to reuse for subsequent hits.
   * @param ttlMs - Time-to-live in milliseconds from now.
   */
  set(key: string, value: unknown, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Drops every entry. Useful after logout or global invalidation hooks.
   */
  clear(): void {
    this.store.clear();
  }
}
