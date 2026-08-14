import type { HttpContext } from '@angular/common/http';

import type { AiesSdkHttpToasts } from '../config/aies-sdk.config';
import {
  type ToastHttpOptions,
  withToast,
} from './toast-http.context';

/**
 * Resolve {@link HttpContext} toast flags for an {@link ApiClient} request.
 *
 * Precedence: per-request `toast: false` wins (no tag). Otherwise merge config
 * {@link AiesSdkHttpToasts} with per-request overrides.
 *
 * @param configMode - From {@link AiesSdkConfig.httpToasts} (defaults to `'off'`).
 * @param perRequest - From {@link ApiRequestOptions.toast}.
 */
export function resolveHttpToastContext(
  configMode: AiesSdkHttpToasts | undefined,
  perRequest: Partial<ToastHttpOptions> | false | undefined,
): HttpContext | undefined {
  if (perRequest === false) {
    return undefined;
  }

  const fromConfig = configToastDefaults(configMode);
  const merged = perRequest
    ? { ...fromConfig, ...perRequest }
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
  mode: AiesSdkHttpToasts | undefined,
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
