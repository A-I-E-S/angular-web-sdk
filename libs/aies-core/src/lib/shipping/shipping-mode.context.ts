import { HttpContext, HttpContextToken } from '@angular/common/http';

import type { ShippingMode } from '@aies/aies-models';

/**
 * Per-request shipping-mode override for {@link shipmentModeInterceptor}.
 *
 * When set, `x-shipment-mode` uses this value instead of
 * {@link ShippingModeService.mode}. The tab / session mode is unchanged.
 * Sentinel `null` means “use the active tab mode”.
 */
export const SHIPPING_MODE_OVERRIDE = new HttpContextToken<ShippingMode | null>(
  () => null,
);

/**
 * Narrow unknown JSON / option values to a {@link ShippingMode}.
 *
 * @param value - Candidate value.
 * @returns `'stn'` or `'sfn'` when valid; otherwise `undefined`.
 */
export function asShippingMode(value: unknown): ShippingMode | undefined {
  return value === 'stn' || value === 'sfn' ? value : undefined;
}

/**
 * Tag a request so {@link shipmentModeInterceptor} sends a different
 * `x-shipment-mode` without calling {@link ShippingModeService.setMode}.
 *
 * Prefer {@link ApiRequestOptions.shippingMode} on {@link ApiClient} calls.
 * Use this helper with raw `HttpClient`.
 *
 * @param mode - Mode for this request only.
 * @param context - Existing context to merge (e.g. from {@link withToast}).
 * @returns HttpContext with the override set.
 *
 * @example
 * ```ts
 * this.http.post(url, body, { context: withShippingMode('stn') });
 * ```
 */
export function withShippingMode(
  mode: ShippingMode,
  context?: HttpContext,
): HttpContext {
  return (context ?? new HttpContext()).set(SHIPPING_MODE_OVERRIDE, mode);
}
