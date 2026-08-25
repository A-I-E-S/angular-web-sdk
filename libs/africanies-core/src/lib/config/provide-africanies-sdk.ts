import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import { provideLocalStorage } from '@africanies/africanies-storage';

import { provideModeConfig } from '../mode/provide-mode-config';
import { AFRICANIES_SDK_CONFIG, type AfricaniesSdkConfig } from './africanies-sdk.config';

/**
 * Registers SDK configuration and ensures browser storage is available.
 *
 * Also calls {@link provideLocalStorage} so theme / mode-config / auth-token
 * persistence works out of the box. {@link ShippingModeService} always uses
 * {@link SessionStorageService} so each tab can hold its own STN/SFN mode.
 * When {@link AfricaniesSdkConfig.loadModeConfig} is not `false`, {@link provideModeConfig}
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
 *   provideAfricaniesSdk,
 *   provideAfricaniesHttpClient,
 * } from '@africanies/africanies-core';
 * import { provideSessionStorage } from '@africanies/africanies-storage';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAfricaniesSdk({
 *       baseUrl: import.meta.env['NG_APP_API_URL'],
 *       timeout: 30_000,
 *     }),
 *     // Optional: override the localStorage default registered above
 *     // provideSessionStorage(),
 *     provideAfricaniesHttpClient(),
 *     // Or with app interceptors:
 *     // provideAfricaniesHttpClient({ interceptors: [loggingInterceptor] }),
 *   ],
 * };
 * ```
 */
export function provideAfricaniesSdk(config: AfricaniesSdkConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AFRICANIES_SDK_CONFIG, useValue: config },
    provideLocalStorage(),
    ...(config.loadModeConfig !== false ? [provideModeConfig()] : []),
  ]);
}
