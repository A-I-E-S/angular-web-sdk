import {
  inject,
  Injectable,
  Injector,
  type Signal,
  signal,
} from '@angular/core';

import type { ShippingMode } from '@aies/aies-models';
import {
  AIES_SHIPPING_MODE_KEY,
  SessionStorageService,
} from '@aies/aies-storage';

import { ApiClient } from '../http/api-client';

const DEFAULT_MODE: ShippingMode = 'sfn';

/**
 * Signal-based holder for the active {@link ShippingMode}.
 *
 * Persists through {@link SessionStorageService} under
 * {@link AIES_SHIPPING_MODE_KEY} so each browser tab can hold its own STN/SFN
 * context (refresh within the tab keeps the choice; other tabs are unaffected).
 * Defaults to `'sfn'` when nothing is stored or the stored value is not a known
 * mode — preferring a safe outbound default over failing open on corrupt storage.
 *
 * Changing mode clears {@link ApiClient}'s GET cache so `readAll` / by-id
 * dumps cannot cross STN↔SFN (cache keys omit the mode header). `ApiClient`
 * is resolved lazily via {@link Injector} to avoid a DI cycle.
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
  private readonly storage = inject(SessionStorageService);
  private readonly injector = inject(Injector);

  private readonly _mode = signal<ShippingMode>(this.readInitialMode());

  /**
   * Read-only view of the current shipping mode (`Signal` = Angular's
   * readonly signal surface; mutate only via {@link setMode}).
   */
  readonly mode: Signal<ShippingMode> = this._mode.asReadonly();

  /**
   * Updates the active mode and persists it for the current tab.
   * No-ops when `mode` already matches the current value.
   *
   * @param mode - `'stn'` or `'sfn'`.
   */
  setMode(mode: ShippingMode): void {
    if (mode === this._mode()) {
      return;
    }
    this._mode.set(mode);
    this.storage.set<ShippingMode>(AIES_SHIPPING_MODE_KEY, mode);
    this.injector.get(ApiClient).clearCache();
  }

  private readInitialMode(): ShippingMode {
    const stored = this.storage.get<ShippingMode>(AIES_SHIPPING_MODE_KEY);
    return stored === 'stn' || stored === 'sfn' ? stored : DEFAULT_MODE;
  }
}
