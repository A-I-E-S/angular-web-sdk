import { HttpErrorResponse } from '@angular/common/http';

/**
 * User-facing copy for playground HTTP / async failures.
 *
 * @param err - Thrown value or HttpClient error.
 * @param options - Optional context for auth-related hints.
 * @param options.suggestApiToken - When true, hint at setting an API token.
 * @returns Short message suitable for a toast or inline error.
 */
export function playgroundErrorMessage(
  err: unknown,
  options?: { suggestApiToken?: boolean },
): string {
  if (typeof err === 'string' && err.trim()) {
    return err.trim();
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: unknown } | string | null;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }
    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }
    if (err.status === 0) {
      return 'Network error. Check your connection.';
    }
    if (err.status === 401 || err.status === 403) {
      return options?.suggestApiToken
        ? 'Authentication failed. Paste a valid API token in the header.'
        : 'You do not have permission to do that.';
    }
    if (err.status >= 500) {
      return 'Server error. Try again in a moment.';
    }
    return err.message || `Request failed (${err.status})`;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) {
      return msg.trim();
    }
  }
  return 'Something went wrong.';
}
