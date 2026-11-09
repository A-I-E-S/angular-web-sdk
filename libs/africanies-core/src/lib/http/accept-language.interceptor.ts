import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AFRICANIES_HTTP_ACCEPT_LANGUAGE } from './accept-language.context';

/**
 * Sets `Accept-Language` from {@link AFRICANIES_HTTP_ACCEPT_LANGUAGE} when the
 * host provides that signal (typically the UI language switcher code).
 *
 * Prefer {@link provideAfricaniesHttpClient}, which registers this interceptor
 * by default. Without the token, requests are left unchanged.
 *
 * @param req - Outgoing request.
 * @param next - Next handler in the interceptor chain.
 * @returns The downstream observable for the cloned request.
 * @example
 * ```ts
 * provideAfricaniesHttpClient(),
 * { provide: AFRICANIES_HTTP_ACCEPT_LANGUAGE, useFactory: () => inject(AppLanguageService).lang },
 * ```
 */
export const acceptLanguageInterceptor: HttpInterceptorFn = (req, next) => {
  const langSignal = inject(AFRICANIES_HTTP_ACCEPT_LANGUAGE, {
    optional: true,
  });
  const lang = langSignal?.()?.trim();
  if (!lang) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { 'Accept-Language': lang },
    }),
  );
};
