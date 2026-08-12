import { HttpContext, HttpContextToken } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

/**
 * Per-request toast flags for {@link httpToastInterceptor}.
 *
 * Attach with {@link withToast}. When the token is absent, the interceptor
 * stays quiet — toasting is opt-in per call.
 */
export interface ToastHttpOptions {
  /** Show a success toast when the response is OK. Default `true`. */
  success: boolean;
  /** Show an error toast when the request fails. Default `true`. */
  error: boolean;
  /** Override the default success copy. */
  successMessage?: string;
  /** Override the default error copy. */
  errorMessage?: string;
}

/**
 * Optional bridge from HTTP → toast UI.
 *
 * Provided by `@aies/aies-ui` {@link provideAiesToasts}. When missing,
 * {@link httpToastInterceptor} is a no-op even if {@link withToast} is set.
 */
export interface AiesHttpToastHandler {
  /** Timed success toast. */
  success(message: string): void;
  /** Persistent error toast (user must dismiss). */
  error(message: string): void;
}

/** DI token for the HTTP → toast bridge. */
export const AIES_HTTP_TOAST = new InjectionToken<AiesHttpToastHandler>(
  'AIES_HTTP_TOAST',
);

/**
 * Present only when the request was tagged with {@link withToast}.
 * Sentinel `null` means “not tagged”.
 */
export const TOAST_HTTP_OPTIONS = new HttpContextToken<ToastHttpOptions | null>(
  () => null,
);

/**
 * Opt a request into HTTP toasts.
 *
 * Defaults: `success: true`, `error: true`. Pass flags to silence either side.
 *
 * @param options - Partial overrides for the defaults.
 * @returns HttpContext ready to pass as `context` on HttpClient calls.
 *
 * @example
 * ```ts
 * // Success + error toasts
 * this.http.post(url, body, { context: withToast() });
 *
 * // Errors only
 * this.http.post(url, body, { context: withToast({ success: false }) });
 *
 * // Custom copy
 * this.http.post(url, body, {
 *   context: withToast({
 *     successMessage: 'Shipment saved',
 *     errorMessage: 'Could not save shipment',
 *   }),
 * });
 * ```
 */
export function withToast(
  options?: Partial<ToastHttpOptions>,
): HttpContext {
  return new HttpContext().set(TOAST_HTTP_OPTIONS, {
    success: options?.success ?? true,
    error: options?.error ?? true,
    successMessage: options?.successMessage,
    errorMessage: options?.errorMessage,
  });
}
