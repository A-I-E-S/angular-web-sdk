import type { HttpContext } from '@angular/common/http';

import type { AiesSdkHttpToasts } from '../config/aies-sdk.config';
import type { ApiRequestOptions } from './api-client';
import { resolveHttpToastContext } from './resolve-http-toast-context';
import {
  asShippingMode,
  withShippingMode,
} from '../shipping/shipping-mode.context';

/**
 * Build {@link HttpContext} for an {@link ApiClient} request.
 *
 * Merges SDK config toasts, per-request toast flags, and optional
 * {@link ApiRequestOptions.shippingMode} override.
 *
 * @param configMode - From {@link AiesSdkConfig.httpToasts}.
 * @param options - Per-request {@link ApiClient} options.
 */
export function resolveApiRequestContext(
  configMode: AiesSdkHttpToasts | undefined,
  options: ApiRequestOptions,
  method?: string,
): HttpContext | undefined {
  let context = resolveHttpToastContext(configMode, options.toast, method);
  const shippingMode = asShippingMode(options.shippingMode);
  if (shippingMode) {
    context = withShippingMode(shippingMode, context);
  }
  return context;
}

/**
 * Effective shipping mode for one {@link ApiClient} request.
 *
 * @param options - Per-request options (may include {@link ApiRequestOptions.shippingMode}).
 * @param activeMode - Current tab mode from {@link ShippingModeService}.
 */
export function resolveRequestShippingMode(
  options: ApiRequestOptions | undefined,
  activeMode: 'stn' | 'sfn',
): 'stn' | 'sfn' {
  return asShippingMode(options?.shippingMode) ?? activeMode;
}
