import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { provideLocalStorage } from '@aies/aies-storage';

import { AIES_SDK_CONFIG, type AiesSdkConfig } from './aies-sdk.config';

/**
 * Registers SDK configuration and ensures browser storage is available.
 *
 * Also calls {@link provideLocalStorage} so theme / shipping-mode persistence
 * works out of the box. Apps that prefer session-scoped storage should call
 * {@link provideSessionStorage} **after** this provider so it overrides the
 * default localStorage binding.
 *
 * @param config - API origin and optional timeout / default headers.
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import {
 *   provideAiesSdk,
 *   shipmentModeInterceptor,
 *   authInterceptor,
 * } from '@aies/aies-core';
 * import { provideSessionStorage } from '@aies/aies-storage';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAiesSdk({
 *       baseUrl: import.meta.env['NG_APP_API_URL'],
 *       timeout: 30_000,
 *     }),
 *     // Optional: override the localStorage default registered above
 *     // provideSessionStorage(),
 *     provideHttpClient(
 *       withInterceptors([shipmentModeInterceptor, authInterceptor]),
 *     ),
 *   ],
 * };
 * ```
 */
export function provideAiesSdk(config: AiesSdkConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AIES_SDK_CONFIG, useValue: config },
    // Storage defaults to localStorage; apps may override with provideSessionStorage().
    provideLocalStorage(),
  ]);
}
