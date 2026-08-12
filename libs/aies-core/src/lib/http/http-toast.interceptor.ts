import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, tap, throwError } from 'rxjs';

import {
  AIES_HTTP_TOAST,
  TOAST_HTTP_OPTIONS,
} from './toast-http.context';

/**
 * Shows success / error toasts for requests tagged with {@link withToast}.
 *
 * Requires {@link AIES_HTTP_TOAST} (from `provideAiesToasts` in `@aies/aies-ui`).
 * Untagged requests never toast. Missing handler → silent no-op.
 * @param req - Outgoing HTTP request.
 * @param next - Next interceptor handler.
 * @returns Observable for the HTTP response stream.
 */
export const httpToastInterceptor: HttpInterceptorFn = (req, next) => {
  const options = req.context.get(TOAST_HTTP_OPTIONS);
  if (!options) {
    return next(req);
  }

  const toast = inject(AIES_HTTP_TOAST, { optional: true });
  if (!toast) {
    return next(req);
  }

  return next(req).pipe(
    tap(() => {
      if (options.success) {
        toast.success(options.successMessage ?? 'Done');
      }
    }),
    catchError((err: unknown) => {
      if (options.error) {
        toast.error(options.errorMessage ?? defaultHttpErrorMessage(err));
      }
      return throwError(() => err);
    }),
  );
};

/**
 * @param err - Failure from HttpClient.
 * @returns Short user-facing copy.
 */
function defaultHttpErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: unknown } | string | null;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (err.status === 0) {
      return 'Network error. Check your connection.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'You do not have permission to do that.';
    }
    if (err.status >= 500) {
      return 'Server error. Try again in a moment.';
    }
    return err.message || `Request failed (${err.status})`;
  }
  return 'Something went wrong.';
}
