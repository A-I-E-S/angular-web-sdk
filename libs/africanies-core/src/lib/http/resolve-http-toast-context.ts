import type { HttpContext } from '@angular/common/http';

import type { AfricaniesSdkHttpToasts } from '../config/africanies-sdk.config';
import {
  type ToastHttpOptions,
  withToast,
} from './toast-http.context';

/**
 *
 */
export type HttpToastMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;

/**
 * Resolve {@link HttpContext} toast flags for an {@link ApiClient} request.
 *
 * Precedence:
 * 1. Per-request `toast: false` — never tag.
 * 2. GET — silent by default (list/detail failures stay in-page). Opt in with
 *    an explicit per-request toast object.
 * 3. Otherwise merge config {@link AfricaniesSdkHttpToasts} with per-request overrides
 *    (POST / PUT / PATCH / DELETE toast errors when config is `'errors'`).
 *
 * @param configMode - From {@link AfricaniesSdkConfig.httpToasts} (defaults to `'off'`).
 * @param perRequest - From {@link ApiRequestOptions.toast}.
 * @param method - HTTP verb so GET stays quiet under `'errors'` / `'all'`.
 */
export function resolveHttpToastContext(
  configMode: AfricaniesSdkHttpToasts | undefined,
  perRequest: Partial<ToastHttpOptions> | false | undefined,
  method?: HttpToastMethod,
): HttpContext | undefined {
  if (perRequest === false) {
    return undefined;
  }

  const isGet = (method ?? '').toUpperCase() === 'GET';
  if (isGet && perRequest == null) {
    return undefined;
  }

  const fromConfig = isGet ? null : configToastDefaults(configMode);
  const merged = perRequest
    ? { ...(fromConfig ?? {}), ...perRequest }
    : fromConfig;

  if (!merged) {
    return undefined;
  }

  const success = merged.success ?? true;
  const error = merged.error ?? true;
  if (!success && !error) {
    return undefined;
  }

  return withToast({
    success,
    error,
    successMessage: merged.successMessage,
    errorMessage: merged.errorMessage,
  });
}

function configToastDefaults(
  mode: AfricaniesSdkHttpToasts | undefined,
): Partial<ToastHttpOptions> | null {
  if (mode == null || mode === 'off') {
    return null;
  }
  if (mode === 'errors') {
    return { success: false, error: true };
  }
  if (mode === 'all') {
    return { success: true, error: true };
  }
  return mode;
}
