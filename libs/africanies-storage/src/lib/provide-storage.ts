import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';
import { STORAGE_TOKEN } from './storage.token';

/**
 * Explicitly binds {@link STORAGE_TOKEN} to {@link LocalStorageService}.
 *
 * Redundant with the token's root factory, but useful when an app previously
 * registered session storage and needs to switch back, or for clarity in
 * `app.config.ts`.
 *
 * @returns Environment providers wiring `STORAGE_TOKEN` → localStorage.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideLocalStorage()],
 * });
 * ```
 */
export function provideLocalStorage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    LocalStorageService,
    { provide: STORAGE_TOKEN, useExisting: LocalStorageService },
  ]);
}

/**
 * Binds {@link STORAGE_TOKEN} to {@link SessionStorageService}.
 *
 * Prefer this when SDK consumers (theme, auth token) should persist only
 * for the current tab rather than across sessions.
 *
 * Shipping mode always uses {@link SessionStorageService} directly and is
 * unaffected by this override.
 *
 * @returns Environment providers wiring `STORAGE_TOKEN` → sessionStorage.
 *
 * @example
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [provideSessionStorage()],
 * });
 * ```
 */
export function provideSessionStorage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    SessionStorageService,
    { provide: STORAGE_TOKEN, useExisting: SessionStorageService },
  ]);
}
