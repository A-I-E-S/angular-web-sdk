import { inject, Injectable, type Signal, signal } from '@angular/core';
import type {
  ApiResponseModel,
  ModeAppType,
  ModeConfigData,
  ModeRegionConfig,
  ModeSfnConfig,
  ModeStnConfig,
} from '@aies/aies-models';
import { Observable, tap } from 'rxjs';

import { ApiClient } from '../http/api-client';
import { ShippingModeService } from '../shipping/shipping-mode.service';

/**
 * Loads and exposes public mode/region metadata (units, currency).
 *
 * Fetches `/public/mode/config` in wrapped mode — that endpoint typically
 * sends `success` / `data` / `status_code` without `errors` or `pagination`,
 * which exercises {@link normalize}'s null-coalescing.
 *
 * Errors are **not** swallowed: callers (or TanStack Query) decide how to
 * surface failures. Wire format may be snake_case; this service maps region
 * fields to the camelCase {@link ModeConfigData} model at the boundary.
 *
 * @example
 * ```ts
 * // app startup
 * const modes = inject(ModeConfigService);
 * modes.loadConfig().subscribe();
 *
 * // later — format money for a shipment origin
 * const region = modes.getRegionConfig(shipment.originCountry);
 * if (region) {
 *   formatAmount(amount, region.currency, region.currencySymbol);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ModeConfigService {
  private readonly api = inject(ApiClient);
  private readonly shippingMode = inject(ShippingModeService);

  private readonly _config = signal<ModeConfigData | null>(null);
  private readonly _loading = signal(false);

  /** Latest successfully loaded config, or `null` before the first success. */
  readonly config: Signal<ModeConfigData | null> = this._config.asReadonly();

  /** `true` while a {@link loadConfig} request is in flight. */
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  /**
   * Fetches mode config and updates {@link config}.
   * Safe to call multiple times — each call refreshes the signal on success.
   *
   * @returns Observable of the normalized envelope; errors propagate to subscribers.
   */
  loadConfig(): Observable<ApiResponseModel<ModeConfigData>> {
    this._loading.set(true);
    return this.api.get<ModeConfigData>('/public/mode/config').pipe(
      tap({
        next: (res) => {
          if (res.data !== null) {
            this._config.set(mapModeConfigData(res.data));
          }
          this._loading.set(false);
        },
        error: () => {
          this._loading.set(false);
        },
      }),
    );
  }

  /**
   * Resolves region display units/currency for a country within an app type.
   *
   * @param countryCode - ISO-ish country key (`'ng'`, `'us'`, …) or `null`
   *   to force the mode's `default` region.
   * @param appType - Defaults to {@link ShippingModeService.mode} so callers
   *   rarely need to pass the active STN/SFN surface explicitly.
   * @returns Matching {@link ModeRegionConfig}, the mode `default`, or `null`
   *   when config has not been loaded yet.
   */
  getRegionConfig(
    countryCode: string | null,
    appType?: ModeAppType,
  ): ModeRegionConfig | null {
    const config = this._config();
    if (config === null) {
      return null;
    }

    const type: ModeAppType = appType ?? this.shippingMode.mode();
    const regions: ModeSfnConfig | ModeStnConfig =
      type === 'sfn' ? config.sfn : config.stn;

    if (countryCode !== null && countryCode !== '') {
      const key = countryCode.toLowerCase();
      const keyed = regions as unknown as Record<string, ModeRegionConfig>;
      if (Object.prototype.hasOwnProperty.call(keyed, key)) {
        return keyed[key] ?? null;
      }
    }

    return regions.default;
  }
}

/**
 * Map a possibly snake_case region object into {@link ModeRegionConfig}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 */
function mapRegionConfig(raw: unknown): ModeRegionConfig {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    dimensionUnit: (record['dimensionUnit'] ??
      record['dimension_unit']) as ModeRegionConfig['dimensionUnit'],
    massUnit: (record['massUnit'] ??
      record['mass_unit']) as ModeRegionConfig['massUnit'],
    currency: (record['currency'] ?? 'NGN') as ModeRegionConfig['currency'],
    currencySymbol: String(
      record['currencySymbol'] ?? record['currency_symbol'] ?? '',
    ),
  };
}

/**
 * Map every region entry under a mode (`default`, `ng`, `us`, …).
 */
function mapModeRegions(modeRaw: unknown): Record<string, ModeRegionConfig> {
  const mode = (modeRaw ?? {}) as Record<string, unknown>;
  const out: Record<string, ModeRegionConfig> = {};
  for (const [key, value] of Object.entries(mode)) {
    out[key] = mapRegionConfig(value);
  }
  return out;
}

/**
 * Deep-map mode config so SDK consumers never see wire snake_case.
 */
function mapModeConfigData(
  raw: ModeConfigData | Record<string, unknown>,
): ModeConfigData {
  const record = raw as Record<string, unknown>;
  return {
    // Cast via unknown: wire payloads are loosely typed until mapped.
    sfn: mapModeRegions(record['sfn']) as unknown as ModeSfnConfig,
    stn: mapModeRegions(record['stn']) as unknown as ModeStnConfig,
  };
}
