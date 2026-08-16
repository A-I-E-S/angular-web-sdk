import { HttpErrorResponse } from '@angular/common/http';

import { formatApiErrorMessage } from '@aies/aies-core';

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
  if (err instanceof HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      return options?.suggestApiToken
        ? 'Authentication failed. Paste a valid API token in the header.'
        : 'You do not have permission to do that.';
    }
  }
  return formatApiErrorMessage(err);
}
