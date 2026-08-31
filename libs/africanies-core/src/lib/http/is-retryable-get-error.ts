import { HttpErrorResponse } from '@angular/common/http';

/**
 * Whether a failed GET *would* be a candidate for automatic retry.
 *
 * {@link ApiClient} no longer auto-retries (fail fast for manual UI Retry).
 * Kept for callers/tests that still want to classify transient vs permanent
 * failures.
 *
 * Transient: network blips, timeouts, 408/429, 5xx.
 * Auth and other 4xx fail fast — retrying 401 does not help.
 *
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
