import { InjectionToken, type Signal } from '@angular/core';

/**
 * Optional host-provided active language code for API calls
 * (e.g. `en` / `zh` from the app language switcher).
 *
 * When provided, {@link acceptLanguageInterceptor} sets `Accept-Language`
 * on every request. Omit the token to leave that header unset.
 */
export const AFRICANIES_HTTP_ACCEPT_LANGUAGE = new InjectionToken<
  Signal<string>
>('AFRICANIES_HTTP_ACCEPT_LANGUAGE');
