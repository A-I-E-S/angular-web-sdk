import { HttpErrorResponse } from '@angular/common/http';

import { normalize } from './normalize';
import { joinApiErrorMessages } from './validation-bag';
import { asRecord } from './wire';

/**
 * Resolve user-facing error copy from an API envelope, raw body, or HttpClient error.
 *
 * Prefers joined field messages when present; otherwise envelope / HTTP `message`.
 *
 * Prefer relying on {@link ApiClient}: HTTP failures are already rethrown as
 * `Error` with this text on `.message`. Hosts mainly need this helper when
 * calling Angular `HttpClient` directly (e.g. toast interceptor).
 *
 * @param input - Normalized response, raw JSON body, or {@link HttpErrorResponse}.
 */
export function formatApiErrorMessage(input: unknown): string {
  if (typeof input === 'string' && input.trim()) {
    return input.trim();
  }

  if (input instanceof HttpErrorResponse) {
    const fromBody = formatApiErrorMessage(input.error);
    if (fromBody !== 'Something went wrong.') {
      return fromBody;
    }
    if (input.status === 0) {
      return 'Network error. Check your connection.';
    }
    if (input.status === 401 || input.status === 403) {
      return 'Authentication failed. Check your access token.';
    }
    if (input.status >= 500) {
      return 'Server error. Try again in a moment.';
    }
    if (input.message?.trim()) {
      return input.message.trim();
    }
    return `Request failed (${input.status})`;
  }

  if (input && typeof input === 'object' && 'success' in input && 'data' in input) {
    const normalized = normalize<unknown>(input);
    return (
      joinApiErrorMessages(normalized.errors) ??
      normalized.message?.trim() ??
      'Something went wrong.'
    );
  }

  if (input && typeof input === 'object') {
    const record = asRecord(input);
    if (
      record &&
      typeof record['message'] === 'string' &&
      record['message'].trim()
    ) {
      return record['message'].trim();
    }
  }

  if (input instanceof Error && input.message.trim()) {
    return input.message.trim();
  }

  return 'Something went wrong.';
}
