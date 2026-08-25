import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { catchError, tap, throwError } from 'rxjs';

import { formatApiErrorMessage } from './api-error-message';
import {
  AFRICANIES_HTTP_TOAST,
  TOAST_HTTP_OPTIONS,
} from './toast-http.context';

/**
 * Shows success / error toasts for requests tagged with {@link withToast}.
 *
 * Requires {@link AFRICANIES_HTTP_TOAST} (from `provideAfricaniesToasts` in `@africanies/africanies-ui`).
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

  const toast = inject(AFRICANIES_HTTP_TOAST, { optional: true });
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
 * @returns User-facing copy (joined field errors when the body is a validation bag).
 */
function defaultHttpErrorMessage(err: unknown): string {
  return formatApiErrorMessage(err);
}
