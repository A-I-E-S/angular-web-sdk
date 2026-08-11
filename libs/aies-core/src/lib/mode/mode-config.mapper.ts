import type {
  ModeConfigData,
  ModeRegionConfig,
  ModeSfnConfig,
  ModeStnConfig,
  ShippingMode,
} from '@aies/aies-models';

/** Public mode-config endpoint path (relative to {@link AiesSdkConfig.baseUrl}). */
export const MODE_CONFIG_PATH = '/public/mode/config';

/**
 * Map a possibly snake_case region object into {@link ModeRegionConfig}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 */
export function mapRegionConfig(raw: unknown): ModeRegionConfig {
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

/** Map every region entry under a mode branch (`default`, `ng`, `us`, …). */
export function mapModeRegions(modeRaw: unknown): Record<string, ModeRegionConfig> {
  const mode = (modeRaw ?? {}) as Record<string, unknown>;
  const out: Record<string, ModeRegionConfig> = {};
  for (const [key, value] of Object.entries(mode)) {
    out[key] = mapRegionConfig(value);
  }
  return out;
}

/**
 * Deep-map mode config so SDK consumers never see wire snake_case.
 *
 * @param raw - `data` payload from `/public/mode/config` (before or after mapping).
 */
export function mapModeConfigData(
  raw: ModeConfigData | Record<string, unknown>,
): ModeConfigData {
  const record = raw as Record<string, unknown>;
  return {
    sfn: mapModeRegions(record['sfn']) as unknown as ModeSfnConfig,
    stn: mapModeRegions(record['stn']) as unknown as ModeStnConfig,
  };
}

/**
 * Minimal runtime guard for hydrated storage payloads.
 */
export function isModeConfigData(value: unknown): value is ModeConfigData {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  const sfn = record['sfn'] as Record<string, unknown> | undefined;
  const stn = record['stn'] as Record<string, unknown> | undefined;
  return (
    sfn != null &&
    typeof sfn['default'] === 'object' &&
    stn != null &&
    typeof stn['default'] === 'object'
  );
}

/**
 * Resolve currency and measurement units for a country within a shipping mode.
 *
 * Unknown country codes fall back to the mode's `default` region — the server
 * record is the source of truth; no client-side region tables.
 *
 * @param config - Loaded {@link ModeConfigData} (from API or storage).
 * @param mode - Active `'stn'` or `'sfn'` branch.
 * @param countryCode - Lower/upper ISO-ish key (`ng`, `us`, …) or empty for default.
 */
export function resolveModeRegionConfig(
  config: ModeConfigData,
  mode: ShippingMode,
  countryCode: string | null | undefined,
): ModeRegionConfig {
  const regions: ModeSfnConfig | ModeStnConfig =
    mode === 'sfn' ? config.sfn : config.stn;

  if (countryCode != null && countryCode !== '') {
    const key = countryCode.toLowerCase();
    const keyed = regions as unknown as Record<string, ModeRegionConfig | undefined>;
    if (key !== 'default' && keyed[key] != null) {
      return keyed[key]!;
    }
  }

  return regions.default;
}
