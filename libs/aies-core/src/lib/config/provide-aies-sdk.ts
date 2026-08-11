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
 * Also calls {@link provideLocalStorage} so theme / shipping-mode / mode-config
 * persistence works out of the box. When {@link AiesSdkConfig.loadModeConfig}
 * is not `false`, {@link provideModeConfig} runs on startup.
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
    provideLocalStorage(),
    ...(config.loadModeConfig !== false ? [provideModeConfig()] : []),
  ]);
}
