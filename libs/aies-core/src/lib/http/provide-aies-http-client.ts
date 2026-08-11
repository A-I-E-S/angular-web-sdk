import {
  type HttpFeature,
  type HttpFeatureKind,
  type HttpInterceptorFn,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { type EnvironmentProviders } from '@angular/core';

import { shipmentModeInterceptor } from '../shipping/shipment-mode.interceptor';
import { authInterceptor } from './auth.interceptor';

/**
 * Options for {@link provideAiesHttpClient}.
 */
export interface AiesHttpClientOptions {
  /**
   * Extra interceptors appended **after** the SDK defaults
   * (`shipmentModeInterceptor`, then `authInterceptor`).
   *
   * Use for app-specific concerns (logging, correlation IDs, error toasts).
   */
  interceptors?: HttpInterceptorFn[];
}

/**
 * Registers `HttpClient` with AIES default interceptors baked in.
 *
 * Defaults (in order):
 * 1. {@link shipmentModeInterceptor} — `x-shipment-mode`
 * 2. {@link authInterceptor} — `Authorization` when {@link AUTH_TOKEN_PROVIDER} returns a token
 * 3. Any {@link AiesHttpClientOptions.interceptors} from the host
 *
 * Pass additional {@link provideHttpClient} features (e.g. `withFetch()`) as
 * trailing arguments — same composition model as Angular’s own helper.
 *
 * Prefer this over a bare `provideHttpClient(withInterceptors([...]))` so hosts
 * cannot forget the SDK defaults.
 *
 * @param options - Optional extra interceptors.
 * @param features - Extra `provideHttpClient` features (`withFetch`, etc.).
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * // Minimal — SDK interceptors only
 * provideAiesSdk({ baseUrl: 'https://api.example.com' }),
 * provideAiesHttpClient(),
 *
 * // With app interceptors + fetch backend
 * provideAiesHttpClient(
 *   { interceptors: [correlationInterceptor, errorToastInterceptor] },
 *   withFetch(),
 * ),
 * ```
 */
export function provideAiesHttpClient(
  options?: AiesHttpClientOptions,
  ...features: HttpFeature<HttpFeatureKind>[]
): EnvironmentProviders {
  const extras = options?.interceptors ?? [];
  return provideHttpClient(
    withInterceptors([
      shipmentModeInterceptor,
      authInterceptor,
      ...extras,
    ]),
    ...features,
  );
}
