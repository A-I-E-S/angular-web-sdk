import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';

/**
 * Supplies the bearer token for outbound API calls.
 *
 * Returns `null` when the user is anonymous or auth is not wired yet —
 * {@link authInterceptor} then leaves the request unchanged.
 *
 * Full auth (refresh, storage, login redirect) lands in a later phase;
 * this token exists so apps can plug a real provider without changing
 * interceptor registration.
 */
export type AuthTokenProvider = () => string | null;

/**
 * DI token for the active {@link AuthTokenProvider}.
 *
 * Defaults to a no-op that always returns `null` so the interceptor is safe
 * to register before auth exists.
 *
 * @example
 * ```ts
 * {
 *   provide: AUTH_TOKEN_PROVIDER,
 *   useValue: () => inject(AuthStore).accessToken(),
 * }
 * ```
 */
export const AUTH_TOKEN_PROVIDER = new InjectionToken<AuthTokenProvider>(
  'AIES_AUTH_TOKEN_PROVIDER',
  {
    providedIn: 'root',
    factory: () => () => null,
  },
);

/**
 * Functional interceptor that sets `Authorization: Bearer <token>` when
 * {@link AUTH_TOKEN_PROVIDER} returns a non-null token.
 *
 * Compose via {@link provideAiesHttpClient} (preferred) or pass explicitly to
 * `provideHttpClient(withInterceptors([...]))`.
 *
 * @param req - Outgoing request.
 * @param next - Next handler in the interceptor chain.
 * @returns The downstream observable for the (possibly cloned) request.
 * @example
 * ```ts
 * provideAiesHttpClient(),
 * // or with extras:
 * provideAiesHttpClient({ interceptors: [myInterceptor] }),
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AUTH_TOKEN_PROVIDER)();
  if (token === null || token === '') {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
