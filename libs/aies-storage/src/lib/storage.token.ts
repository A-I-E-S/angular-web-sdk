import { InjectionToken, inject } from '@angular/core';

import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.service';

/**
 * DI token for the active {@link StorageService} implementation.
 *
 * Defaults to {@link LocalStorageService} via `providedIn: 'root'`. Override
 * in tests or at bootstrap with {@link provideSessionStorage} /
 * {@link provideLocalStorage}.
 *
 * @example
 * ```ts
 * const storage = inject(STORAGE_TOKEN);
 * storage.set('prefs', { dense: true });
 * ```
 */
export const STORAGE_TOKEN = new InjectionToken<StorageService>('AIES_STORAGE', {
  providedIn: 'root',
  factory: () => inject(LocalStorageService),
});
