import { HttpErrorResponse } from '@angular/common/http';

/**
 * Whether a failed GET should be retried by {@link ApiClient}.
 *
 * Retries transient failures only (network blips, timeouts, 408/429, 5xx).
 * Auth and other 4xx errors fail fast — retrying 401 does not help and causes
 * duplicate requests + toasts.
 * @param err
 */
export function isRetryableGetError(err: unknown): boolean {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return true;
    }
    if (err.status === 408 || err.status === 429) {
      return true;
    }
    if (err.status >= 500) {
      return true;
    }
    return false;
  }
  // Non-HTTP failures (e.g. timeout operator) may still be transient.
  return true;
}
