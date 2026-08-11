import { inject, Injectable, type Signal, signal } from '@angular/core';

import type { ShippingMode } from '@aies/aies-models';
import { AIES_SHIPPING_MODE_KEY, STORAGE_TOKEN } from '@aies/aies-storage';

const DEFAULT_MODE: ShippingMode = 'sfn';

/**
 * Signal-based holder for the active {@link ShippingMode}.
 *
 * Persists through {@link STORAGE_TOKEN} under {@link AIES_SHIPPING_MODE_KEY}
 * so a refresh keeps STN/SFN context. Defaults to `'sfn'` when nothing is
 * stored or the stored value is not a known mode — preferring a safe outbound
 * default over failing open on corrupt storage.
 *
 * Provided in root; no explicit provider registration is required.
 * Pair with {@link shipmentModeInterceptor} so HTTP calls advertise the mode.
 *
 * @example
 * ```ts
 * // app.config.ts — register the interceptor (service is providedIn: 'root')
 * provideHttpClient(
 *   withInterceptors([shipmentModeInterceptor, authInterceptor]),
 * );
 *
 * // feature code
 * const shipping = inject(ShippingModeService);
 * shipping.setMode('stn');
 * console.log(shipping.mode()); // 'stn'
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ShippingModeService {
  private readonly storage = inject(STORAGE_TOKEN);

  private readonly _mode = signal<ShippingMode>(this.readInitialMode());

  /**
   * Read-only view of the current shipping mode (`Signal` = Angular's
   * readonly signal surface; mutate only via {@link setMode}).
   */
  readonly mode: Signal<ShippingMode> = this._mode.asReadonly();

  /**
   * Updates the active mode and persists it for subsequent sessions.
   *
   * @param mode - `'stn'` or `'sfn'`.
   */
  setMode(mode: ShippingMode): void {
    this._mode.set(mode);
    this.storage.set<ShippingMode>(AIES_SHIPPING_MODE_KEY, mode);
  }

  private readInitialMode(): ShippingMode {
    const stored = this.storage.get<ShippingMode>(AIES_SHIPPING_MODE_KEY);
    return stored === 'stn' || stored === 'sfn' ? stored : DEFAULT_MODE;
  }
}
