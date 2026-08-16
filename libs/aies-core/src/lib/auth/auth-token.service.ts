import { inject, Injectable, type Signal, signal } from '@angular/core';

import { AIES_ACCESS_TOKEN_KEY, STORAGE_TOKEN } from '@aies/aies-storage';

import { ApiClient } from '../http/api-client';

/**
 * Holds the bearer access token used by {@link authInterceptor}.
 *
 * After login/register in the host app, call {@link set}. The SDK persists the
 * token via {@link STORAGE_TOKEN} and attaches `Authorization: Bearer …` on
 * outbound HTTP. On logout, call {@link UserService.logoutFromAllSessions}
 * while the token is still set, then {@link clear} (also clears the GET cache).
 *
 * @example
 * ```ts
 * const auth = inject(AuthTokenService);
 * const users = inject(UserService);
 *
 * // after login
 * auth.set(res.access_token);
 *
 * // later — UserService.me() is authenticated automatically
 * // on logout — POST while the token is still set, then drop it
 * users.logoutFromAllSessions().subscribe({
 *   next: () => auth.clear(),
 *   error: () => auth.clear(),
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly storage = inject(STORAGE_TOKEN);
  private readonly api = inject(ApiClient);

  private readonly _token = signal<string | null>(this.readInitialToken());

  /** Read-only view of the current access token. */
  readonly token: Signal<string | null> = this._token.asReadonly();

  /**
   * Current access token, or `null` when logged out / unset.
   */
  get(): string | null {
    return this._token();
  }

  /**
   * Persist and activate an access token from login/register.
   *
   * @param accessToken - Bearer token string (whitespace-only is treated as clear).
   */
  set(accessToken: string): void {
    const trimmed = accessToken.trim();
    if (trimmed === '') {
      this.clear();
      return;
    }
    this._token.set(trimmed);
    this.storage.set<string>(AIES_ACCESS_TOKEN_KEY, trimmed);
  }

  /**
   * Remove the token from memory and storage, and clear the HTTP GET cache.
   */
  clear(): void {
    this._token.set(null);
    this.storage.remove(AIES_ACCESS_TOKEN_KEY);
    this.api.clearCache();
  }

  private readInitialToken(): string | null {
    const stored = this.storage.get<string>(AIES_ACCESS_TOKEN_KEY);
    if (typeof stored !== 'string') {
      return null;
    }
    const trimmed = stored.trim();
    return trimmed === '' ? null : trimmed;
  }
}
