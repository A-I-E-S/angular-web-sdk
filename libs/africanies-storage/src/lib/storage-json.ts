/**
 * JSON helpers over the Web Storage API.
 *
 * Kept internal so Local/Session services stay thin; failure modes are
 * documented on {@link StorageService} for consumers.
 */

/**
 * @param store - `localStorage` or `sessionStorage`.
 * @param key - Key to read.
 * @returns Parsed value, or `null` when missing/empty.
 */
export function readJson<T>(store: Storage, key: string): T | null {
  const raw = store.getItem(key);
  if (raw === null || raw === '') {
    return null;
  }
  return JSON.parse(raw) as T;
}

/**
 * @param store - `localStorage` or `sessionStorage`.
 * @param key - Key to write.
 * @param value - JSON-serializable value.
 */
export function writeJson<T>(store: Storage, key: string, value: T): void {
  store.setItem(key, JSON.stringify(value));
}
