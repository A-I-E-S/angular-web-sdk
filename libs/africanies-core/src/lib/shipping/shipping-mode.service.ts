import {
  inject,
  Injectable,
  Injector,
  type Signal,
  signal,
} from '@angular/core';

import type { ShippingMode } from '@africanies/africanies-models';
import {
  AFRICANIES_SHIPPING_MODE_KEY,
  SessionStorageService,
} from '@africanies/africanies-storage';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { ApiClient } from '../http/api-client';

const DEFAULT_MODE: ShippingMode = 'sfn';

/**
 * Optional gate before a shell mode switch applies.
 *
 * Return `true` to allow {@link ShippingModeService.requestModeChange} to
 * persist the new mode; `false` keeps the current mode.
 */
export type ShippingModeChangeGuard = (
  next: ShippingMode,
  current: ShippingMode,
) => Observable<boolean>;

/**
 * Signal-based holder for the active {@link ShippingMode}.
 *
 * Persists through {@link SessionStorageService} under
 * {@link AFRICANIES_SHIPPING_MODE_KEY} so each browser tab can hold its own STN/SFN
 * context (refresh within the tab keeps the choice; other tabs are unaffected).
 * Defaults to `'sfn'` when nothing is stored or the stored value is not a known
 * mode — preferring a safe outbound default over failing open on corrupt storage.
 *
 * Changing mode clears {@link ApiClient}'s GET cache so `readAll` / by-id
 * dumps cannot cross STN↔SFN (cache keys omit the mode header). `ApiClient`
 * is resolved lazily via {@link Injector} to avoid a DI cycle.
 *
 * List screens should drop in-memory rows and show a blocking loader until
 * the new mode's page arrives — STN rows must not linger on SFN. Use
 * `listFetchKind` with `reason: 'mode'`.
 *
 * Features that must warn before a switch (e.g. mid Create Shipment) can
 * {@link registerModeChangeGuard}. The shell switch uses
 * {@link requestModeChange}; programmatic {@link setMode} bypasses the guard.
 *
 * Provided in root; no explicit provider registration is required.
 * Pair with {@link shipmentModeInterceptor} so HTTP calls advertise the mode.
 *
 * @example
 * ```ts
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
  private modeChangeGuard: ShippingModeChangeGuard | null = null;

  /**
   * Read-only view of the current shipping mode (`Signal` = Angular's
   * readonly signal surface; mutate only via {@link setMode} /
   * {@link requestModeChange}).
   */
  readonly mode: Signal<ShippingMode> = this._mode.asReadonly();

  /**
   * Register a single guard for shell mode switches. Pass `null` to clear
   * (e.g. on feature destroy). Only one guard is active at a time.
   */
  registerModeChangeGuard(guard: ShippingModeChangeGuard | null): void {
    this.modeChangeGuard = guard;
  }

  /**
   * Shell switch entry point: runs any registered guard, then applies the
   * mode when allowed.
   *
   * @param mode - `'stn'` or `'sfn'`.
   * @returns Emits once with `true` when the mode changed, else `false`.
   */
  requestModeChange(mode: ShippingMode): Observable<boolean> {
    if (mode === this._mode()) {
      return of(false);
    }
    const current = this._mode();
    const guard = this.modeChangeGuard;
    const allowed$ = guard ? guard(mode, current) : of(true);
    return allowed$.pipe(
      take(1),
      tap((ok) => {
        if (ok) {
          this.applyMode(mode);
        }
      }),
      map((ok) => !!ok),
    );
  }

  /**
   * Updates the active mode and persists it for the current tab.
   * No-ops when `mode` already matches the current value.
   * Bypasses {@link registerModeChangeGuard} — prefer
   * {@link requestModeChange} for user-driven switches.
   *
   * @param mode - `'stn'` or `'sfn'`.
   */
  setMode(mode: ShippingMode): void {
    if (mode === this._mode()) {
      return;
    }
    this.applyMode(mode);
  }

  private applyMode(mode: ShippingMode): void {
    this._mode.set(mode);
    this.storage.set<ShippingMode>(AFRICANIES_SHIPPING_MODE_KEY, mode);
    this.injector.get(ApiClient).clearCache();
  }

  private readInitialMode(): ShippingMode {
    const stored = this.storage.get<ShippingMode>(AFRICANIES_SHIPPING_MODE_KEY);
    return stored === 'stn' || stored === 'sfn' ? stored : DEFAULT_MODE;
  }
}
