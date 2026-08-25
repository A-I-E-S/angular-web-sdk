import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthTokenService } from '../auth/auth-token.service';

/**
 * Functional interceptor that sets `Authorization: Bearer <token>` when
 * {@link AuthTokenService} has an access token (from {@link AuthTokenService.set}).
 *
 * Compose via {@link provideAfricaniesHttpClient} (preferred) or pass explicitly to
 * `provideHttpClient(withInterceptors([...]))`.
 * @param req
 * @param next
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthTokenService).get();
  if (token === null || token === '') {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
