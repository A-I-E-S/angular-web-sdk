import { inject, Injectable, type Signal, signal } from '@angular/core';
import type {
  ApiResponseModel,
  ModeAppType,
  ModeConfigData,
  ModeRegionConfig,
} from '@aies/aies-models';
import { AIES_MODE_CONFIG_KEY, STORAGE_TOKEN } from '@aies/aies-storage';
import { finalize, Observable, tap } from 'rxjs';

import { ApiClient } from '../http/api-client';
import { ShippingModeService } from '../shipping/shipping-mode.service';
import {
  isModeConfigData,
  mapModeConfigData,
  MODE_CONFIG_PATH,
  resolveModeRegionConfig,
} from './mode-config.mapper';

/**
 * Source of truth for region currency and measurement units (STN / SFN).
 *
 * On startup (via {@link provideModeConfig}), loads
 * `GET /public/mode/config`, normalizes snake_case wire fields once, and
 * persists the mapped record to storage. {@link getRegionConfig} reads that
 * saved record and resolves by country code + active shipping mode.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [
 *   provideAiesSdk({ baseUrl: 'https://test-api-export.africaniestest.com/api' }),
 *   provideHttpClient(withInterceptors([shipmentModeInterceptor])),
 *   provideModeConfig(),
 * ];
 *
 * // feature — format for shipment origin country
 * const modeConfig = inject(ModeConfigService);
 * const region = modeConfig.getRegionConfig('us');
 * if (region) {
 *   console.log(region.currencySymbol, region.massUnit);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ModeConfigService {
  private readonly api = inject(ApiClient);
  private readonly storage = inject(STORAGE_TOKEN);
  private readonly shippingMode = inject(ShippingModeService);

  private readonly _config = signal<ModeConfigData | null>(null);
  private readonly _loading = signal(false);

  /** Latest mode-config record (storage hydrate or last successful fetch). */
  readonly config: Signal<ModeConfigData | null> = this._config.asReadonly();

  /** `true` while {@link loadConfig} is in flight. */
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  constructor() {
    this.hydrateFromStorage();
  }

  /**
   * Fetches mode config from the server, updates {@link config}, and persists.
   *
   * @returns Normalized API envelope; errors propagate to subscribers.
   */
  loadConfig(): Observable<ApiResponseModel<ModeConfigData>> {
    this._loading.set(true);
    return this.api.get<ModeConfigData>(MODE_CONFIG_PATH).pipe(
      tap((res) => {
        if (res.success && res.data !== null) {
          this.saveRecord(mapModeConfigData(res.data));
        }
      }),
      finalize(() => {
        this._loading.set(false);
      }),
    );
  }

  /**
   * Region units and currency for a country code under the active (or given) mode.
   *
   * @param countryCode - e.g. `'ng'`, `'us'`, `'cn'` — unknown keys use `default`.
   * @param appType - Defaults to {@link ShippingModeService.mode}.
   * @returns Resolved region, or `null` before the first load/hydrate.
   */
  getRegionConfig(
    countryCode: string | null | undefined,
    appType?: ModeAppType,
  ): ModeRegionConfig | null {
    const config = this._config();
    if (config === null) {
      return null;
    }

    const mode = appType ?? this.shippingMode.mode();
    return resolveModeRegionConfig(config, mode, countryCode);
  }

  /** Replace the in-memory record and persist — used after {@link loadConfig}. */
  private saveRecord(config: ModeConfigData): void {
    this._config.set(config);
    this.storage.set(AIES_MODE_CONFIG_KEY, config);
  }

  /** Restore the last saved server record so region lookups work offline. */
  private hydrateFromStorage(): void {
    const stored = this.storage.get<ModeConfigData>(AIES_MODE_CONFIG_KEY);
    if (isModeConfigData(stored)) {
      this._config.set(stored);
    }
  }
}
