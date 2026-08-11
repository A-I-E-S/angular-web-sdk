/**
 * Browser key-value persistence abstraction used by theme, shipping mode,
 * and auth token flows.
 *
 * Implementations JSON-serialize values so callers work with typed objects
 * rather than raw strings. Prefer injecting via {@link STORAGE_TOKEN} so
 * tests can swap in an in-memory fake.
 */
export abstract class StorageService {
  /**
   * Reads and deserializes a previously stored value.
   *
   * @typeParam T - Expected value type after JSON parse.
   * @param key - Storage key.
   * @returns The parsed value, or `null` when the key is missing or empty.
   * @throws {DOMException} When storage is inaccessible (e.g. private browsing
   *   with storage disabled) or when reading fails for security reasons.
   * @throws {SyntaxError} When stored content is not valid JSON.
   */
  abstract get<T>(key: string): T | null;

  /**
   * Serializes and writes a value under `key`.
   *
   * @typeParam T - Value type to persist (must be JSON-serializable).
   * @param key - Storage key.
   * @param value - Value to serialize with `JSON.stringify`.
   * @throws {DOMException} `QuotaExceededError` when the storage quota is
   *   exceeded, or when storage is disabled (private browsing).
   * @throws {TypeError} When `value` cannot be serialized to JSON
   *   (e.g. circular structures).
   */
  abstract set<T>(key: string, value: T): void;

  /**
   * Removes a single key if present.
   *
   * @param key - Storage key to delete.
   * @throws {DOMException} When storage is inaccessible.
   */
  abstract remove(key: string): void;

  /**
   * Removes all keys in this storage partition.
   *
   * @throws {DOMException} When storage is inaccessible.
   */
  abstract clear(): void;
}
