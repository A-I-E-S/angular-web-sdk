import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import { readJson, writeJson } from './storage-json';

/**
 * `localStorage`-backed {@link StorageService}.
 *
 * Default root implementation behind {@link STORAGE_TOKEN}. Values survive
 * browser restarts for the origin.
 *
 * @example
 * ```ts
 * const storage = inject(LocalStorageService);
 * try {
 *   storage.set('user', { id: 1 });
 * } catch (err) {
 *   // QuotaExceededError or private-browsing denial
 *   console.warn('persist failed', err);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService extends StorageService {
  /**
   * @inheritdoc
   * @throws {DOMException} Quota exceeded or storage disabled in private browsing.
   * @throws {SyntaxError} Stored value is not valid JSON.
   */
  override get<T>(key: string): T | null {
    return readJson<T>(localStorage, key);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} Quota exceeded or storage disabled in private browsing.
   * @throws {TypeError} Value is not JSON-serializable.
   */
  override set<T>(key: string, value: T): void {
    writeJson(localStorage, key, value);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} When storage is inaccessible.
   */
  override remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} When storage is inaccessible.
   */
  override clear(): void {
    localStorage.clear();
  }
}
