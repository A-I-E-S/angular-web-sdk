import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import { provideLocalStorage } from '@aies/aies-storage';

import { provideModeConfig } from '../mode/provide-mode-config';
import { AIES_SDK_CONFIG, type AiesSdkConfig } from './aies-sdk.config';

/**
 * Registers SDK configuration and ensures browser storage is available.
 *
 * Also calls {@link provideLocalStorage} so theme / mode-config / auth-token
 * persistence works out of the box. {@link ShippingModeService} always uses
 * {@link SessionStorageService} so each tab can hold its own STN/SFN mode.
 * When {@link AiesSdkConfig.loadModeConfig} is not `false`, {@link provideModeConfig}
 * runs on startup.
 *
 * @param config - API origin and optional timeout / default headers.
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { ApplicationConfig } from '@angular/core';
 * import {
 *   provideAiesSdk,
 *   provideAiesHttpClient,
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
 *     provideAiesHttpClient(),
 *     // Or with app interceptors:
 *     // provideAiesHttpClient({ interceptors: [loggingInterceptor] }),
 *   ],
 * };
 * ```
 */
export function provideAiesSdk(config: AiesSdkConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AIES_SDK_CONFIG, useValue: config },
    provideLocalStorage(),
    ...(config.loadModeConfig !== false ? [provideModeConfig()] : []),
  ]);
}
