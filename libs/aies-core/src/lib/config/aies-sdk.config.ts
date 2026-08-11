import { InjectionToken } from '@angular/core';

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
