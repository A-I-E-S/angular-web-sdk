import { Injectable } from '@angular/core';

import { StorageService } from './storage.service';
import { readJson, writeJson } from './storage-json';

/**
 * `sessionStorage`-backed {@link StorageService}.
 *
 * Scope is limited to the current tab/window lifetime — use when values must
 * not outlive the session (e.g. ephemeral UI flags). Register via
 * {@link provideSessionStorage} to bind {@link STORAGE_TOKEN} to this class.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [provideSessionStorage()]
 *
 * // elsewhere
 * const storage = inject(STORAGE_TOKEN);
 * try {
 *   storage.set('wizard.step', 2);
 * } catch (err) {
 *   // QuotaExceededError or private-browsing denial
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class SessionStorageService extends StorageService {
  /**
   * @inheritdoc
   * @throws {DOMException} Quota exceeded or storage disabled in private browsing.
   * @throws {SyntaxError} Stored value is not valid JSON.
   */
  override get<T>(key: string): T | null {
    return readJson<T>(sessionStorage, key);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} Quota exceeded or storage disabled in private browsing.
   * @throws {TypeError} Value is not JSON-serializable.
   */
  override set<T>(key: string, value: T): void {
    writeJson(sessionStorage, key, value);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} When storage is inaccessible.
   */
  override remove(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
   * @inheritdoc
   * @throws {DOMException} When storage is inaccessible.
   */
  override clear(): void {
    sessionStorage.clear();
  }
}
