import {
  type HttpFeature,
  type HttpFeatureKind,
  type HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { type EnvironmentProviders } from '@angular/core';

import { shipmentModeInterceptor } from '../shipping/shipment-mode.interceptor';
import { acceptLanguageInterceptor } from './accept-language.interceptor';
import { authInterceptor } from './auth.interceptor';
import { httpToastInterceptor } from './http-toast.interceptor';

/**
 * Options for {@link provideAfricaniesHttpClient}.
 */
export interface AfricaniesHttpClientOptions {
  /**
   * Extra interceptors appended **after** the SDK defaults
   * (`shipmentModeInterceptor`, `acceptLanguageInterceptor`, `authInterceptor`,
   * `httpToastInterceptor`).
   */
  interceptors?: HttpInterceptorFn[];
}

/**
 * Registers `HttpClient` with AFRICANIES default interceptors baked in.
 *
 * Defaults (in order):
 * 1. {@link shipmentModeInterceptor} — `x-shipment-mode`
 * 2. {@link acceptLanguageInterceptor} — `Accept-Language` when
 *    {@link AFRICANIES_HTTP_ACCEPT_LANGUAGE} is provided
 * 3. {@link authInterceptor} — `Authorization` when {@link AuthTokenService} has a token
 * 4. {@link httpToastInterceptor} — toasts for requests tagged with {@link withToast}
 *    (no-op until `provideAfricaniesToasts()` registers {@link AFRICANIES_HTTP_TOAST})
 * 5. Any {@link AfricaniesHttpClientOptions.interceptors} from the host
 *
 * @param options - Optional extra interceptors.
 * @param features - Extra `provideHttpClient` features (`withFetch`, etc.).
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * provideAfricaniesSdk({ baseUrl: 'https://api.example.com' }),
 * provideAfricaniesHttpClient(),
 * provideAfricaniesToasts(), // from @africanies/africanies-ui — enables HTTP toasts
 * ```
 */
export function provideAfricaniesHttpClient(
  options?: AfricaniesHttpClientOptions,
  ...features: HttpFeature<HttpFeatureKind>[]
): EnvironmentProviders {
  const extras = options?.interceptors ?? [];
  return provideHttpClient(
    withInterceptors([
      shipmentModeInterceptor,
      acceptLanguageInterceptor,
      authInterceptor,
      httpToastInterceptor,
      ...extras,
    ]),
    ...features,
  );
}
