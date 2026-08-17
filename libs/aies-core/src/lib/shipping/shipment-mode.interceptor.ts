import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { SHIPPING_MODE_OVERRIDE } from './shipping-mode.context';
import { ShippingModeService } from './shipping-mode.service';

/**
 * Attaches the current shipping mode as an `x-shipment-mode` header.
 *
 * Uses {@link SHIPPING_MODE_OVERRIDE} when the request was tagged (via
 * {@link ApiRequestOptions.shippingMode} or {@link withShippingMode});
 * otherwise {@link ShippingModeService.mode}. The tab mode is never mutated.
 *
 * Some backends also expect `mode` as a query param (see {@link ApiClient.getResource});
 * this interceptor covers the header half so domain calls stay consistent
 * without each service remembering the header name.
 *
 * Prefer {@link provideAiesHttpClient}, which registers this interceptor by
 * default. {@link ShippingModeService} is `providedIn: 'root'` and needs no
 * extra provider.
 *
 * @param req - Outgoing request.
 * @param next - Next handler in the interceptor chain.
 * @returns The downstream observable for the cloned request.
 * @example
 * ```ts
 * provideAiesSdk({ baseUrl: 'https://api.example.com' }),
 * provideAiesHttpClient(),
 *
 * api.post('/claim', body, { shippingMode: 'stn' });
 * ```
 */
export const shipmentModeInterceptor: HttpInterceptorFn = (req, next) => {
  const override = req.context.get(SHIPPING_MODE_OVERRIDE);
  const mode = override ?? inject(ShippingModeService).mode();
  return next(
    req.clone({
      setHeaders: { 'x-shipment-mode': mode },
    }),
  );
};
