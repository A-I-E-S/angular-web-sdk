import { InjectionToken } from '@angular/core';

import type { ToastHttpOptions } from '../http/toast-http.context';

/**
 * Default HTTP toast behaviour for {@link ApiClient} requests.
 *
 * - `'off'` (default) — no automatic tagging; use {@link withToast} on raw
 *   HttpClient calls or {@link ApiRequestOptions.toast} per SDK call.
 * - `'errors'` — tag mutating SDK requests (POST / PUT / PATCH / DELETE) with
 *   error toasts only. GET stays silent so list/detail screens own their empty
 *   / error UI.
 * - `'all'` — success + error toasts on mutating SDK requests (GET still silent
 *   unless the call opts in).
 * - Partial {@link ToastHttpOptions} — custom defaults merged per mutating request.
 */
export type AiesSdkHttpToasts = 'off' | 'errors' | 'all' | Partial<ToastHttpOptions>;

/**
 * Runtime configuration for the AIES SDK HTTP layer and related services.
 *
 * Provided once at bootstrap via {@link provideAiesSdk} and injected
 * wherever the SDK needs the API origin or shared request defaults.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
 * import { provideAiesSdk, provideAiesHttpClient } from '@aies/aies-core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideZoneChangeDetection({ eventCoalescing: true }),
 *     provideAiesSdk({
 *       baseUrl: 'https://api.example.com',
 *       timeout: 30_000,
 *       defaultHeaders: { 'X-App': 'stn-web' },
 *     }),
 *     provideAiesHttpClient(),
 *   ],
 * };
 * ```
 */
export interface AiesSdkConfig {
  /**
   * Absolute API origin used to resolve relative paths in {@link ApiClient}
   * (e.g. `'https://api.example.com'`). Trailing slashes are trimmed when
   * composing URLs so callers can pass either style.
   */
  baseUrl: string;

  /**
   * Per-request timeout in milliseconds applied by {@link ApiClient}.
   * Omitted when the consumer prefers HttpClient / browser defaults only.
   */
  timeout?: number;

  /**
   * Headers merged onto every {@link ApiClient} request.
   * Request-specific headers override these on key collision.
   */
  defaultHeaders?: Record<string, string>;

  /**
   * When true (default), fetch `/public/mode/config` on startup via
   * {@link provideModeConfig}. Set `false` for tests or offline-only shells.
   */
  loadModeConfig?: boolean;

  /**
   * Automatic {@link withToast} tagging for {@link ApiClient} HTTP calls.
   *
   * Defaults to `'off'` so production apps opt in explicitly. Admin shells use
   * `'errors'` so POST / PUT / PATCH / DELETE failures surface while GET list
   * failures stay in-page.
   */
  httpToasts?: AiesSdkHttpToasts;
}

/**
 * DI token for the active {@link AiesSdkConfig}.
 *
 * Apps must call {@link provideAiesSdk} at bootstrap; injecting without that
 * provider throws so misconfiguration fails fast rather than silently using
 * an empty base URL.
 */
export const AIES_SDK_CONFIG = new InjectionToken<AiesSdkConfig>(
  'AIES_SDK_CONFIG',
);
