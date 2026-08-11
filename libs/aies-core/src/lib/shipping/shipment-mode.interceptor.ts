import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { ShippingModeService } from './shipping-mode.service';

/**
 * Attaches the current shipping mode as an `x-shipment-mode` header.
 *
 * Some backends also expect `mode` as a query param (see {@link ApiClient.getResource});
 * this interceptor covers the header half so domain calls stay consistent
 * without each service remembering the header name.
 *
 * Register alongside {@link authInterceptor} via `provideHttpClient`.
 * {@link ShippingModeService} is `providedIn: 'root'` and needs no extra provider.
 *
 * @param req - Outgoing request.
 * @param next - Next handler in the interceptor chain.
 * @returns The downstream observable for the cloned request.
 * @example
 * ```ts
 * import { provideHttpClient, withInterceptors } from '@angular/common/http';
 * import {
 *   provideAiesSdk,
 *   shipmentModeInterceptor,
 *   authInterceptor,
 * } from '@aies/aies-core';
 *
 * export const appConfig = {
 *   providers: [
 *     provideAiesSdk({ baseUrl: 'https://api.example.com' }),
 *     provideHttpClient(
 *       withInterceptors([shipmentModeInterceptor, authInterceptor]),
 *     ),
 *   ],
 * };
 * ```
 */
export const shipmentModeInterceptor: HttpInterceptorFn = (req, next) => {
  const mode = inject(ShippingModeService).mode();
  return next(
    req.clone({
      setHeaders: { 'x-shipment-mode': mode },
    }),
  );
};
