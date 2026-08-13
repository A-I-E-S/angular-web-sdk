import type {
  ModeConfigDataModel,
  ModeCurrencyCode,
  ModeDimensionUnit,
  ModeMassUnit,
  ModeRegionConfigModel,
  ModeSfnConfigModel,
  ModeStnConfigModel,
  ShippingMode,
} from '@aies/aies-models';

/** Public mode-config endpoint path (relative to {@link AiesSdkConfig.baseUrl}). */
export const MODE_CONFIG_PATH = '/public/mode/config';

/** Fallback region when the wire omits a required branch/key. */
const DEFAULT_REGION: ModeRegionConfigModel = {
  dimensionUnit: 'cm',
  massUnit: 'KG',
  currency: 'NGN',
  currencySymbol: '',
};

/**
 * @param value - Raw dimension unit.
 * @returns Valid {@link ModeDimensionUnit} (defaults to `'cm'`).
 */
function asDimensionUnit(value: unknown): ModeDimensionUnit {
  return value === 'inches' ? 'inches' : 'cm';
}

/**
 * @param value - Raw mass unit.
 * @returns Valid {@link ModeMassUnit} (defaults to `'KG'`).
 */
function asMassUnit(value: unknown): ModeMassUnit {
  return value === 'LBS' ? 'LBS' : 'KG';
}

/**
 * @param value - Raw currency code.
 * @returns Valid {@link ModeCurrencyCode} (defaults to `'NGN'`).
 */
function asCurrency(value: unknown): ModeCurrencyCode {
  return value === 'USD' ? 'USD' : 'NGN';
}

/**
 * Map a possibly snake_case region object into {@link ModeRegionConfigModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * Missing/invalid union fields fall back to safe defaults (never `undefined`).
 * @param raw - Region object from the wire (camel or snake case).
 * @returns Normalized {@link ModeRegionConfigModel}.
 */
export function mapRegionConfig(raw: unknown): ModeRegionConfigModel {
  const record =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  return {
    dimensionUnit: asDimensionUnit(
      record['dimensionUnit'] ?? record['dimension_unit'],
    ),
    massUnit: asMassUnit(record['massUnit'] ?? record['mass_unit']),
    currency: asCurrency(record['currency']),
    currencySymbol: String(
      record['currencySymbol'] ?? record['currency_symbol'] ?? '',
    ),
  };
}

/**
 * Map every region entry under a mode branch (`default`, `ng`, `us`, …).
 * @param modeRaw - SFN or STN branch object keyed by region code.
 * @returns Map of region code → {@link ModeRegionConfigModel}.
 */
export function mapModeRegions(
  modeRaw: unknown,
): Record<string, ModeRegionConfigModel> {
  const mode =
    modeRaw !== null && typeof modeRaw === 'object' && !Array.isArray(modeRaw)
      ? (modeRaw as Record<string, unknown>)
      : {};
  const out: Record<string, ModeRegionConfigModel> = {};
  for (const [key, value] of Object.entries(mode)) {
    out[key] = mapRegionConfig(value);
  }
  return out;
}

/**
 * Pick a region key or fall back through `default` then {@link DEFAULT_REGION}.
 * @param regions - Mapped region map.
 * @param key - Preferred key.
 * @returns Always a concrete {@link ModeRegionConfigModel}.
 */
function regionOrDefault(
  regions: Record<string, ModeRegionConfigModel>,
  key: string,
): ModeRegionConfigModel {
  return regions[key] ?? regions['default'] ?? { ...DEFAULT_REGION };
}

/**
 * Deep-map mode config so SDK consumers never see wire snake_case.
 * Always returns full {@link ModeSfnConfigModel} / {@link ModeStnConfigModel}
 * trees with every required key present.
 *
 * @param raw - `data` payload from `/public/mode/config` (before or after mapping).
 * @returns Fully camelCased {@link ModeConfigDataModel}.
 */
export function mapModeConfigData(
  raw: ModeConfigDataModel | Record<string, unknown>,
): ModeConfigDataModel {
  const record =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const sfnRegions = mapModeRegions(record['sfn']);
  const stnRegions = mapModeRegions(record['stn']);

  const sfn: ModeSfnConfigModel = {
    default: regionOrDefault(sfnRegions, 'default'),
    ng: regionOrDefault(sfnRegions, 'ng'),
  };

  const stn: ModeStnConfigModel = {
    default: regionOrDefault(stnRegions, 'default'),
    us: regionOrDefault(stnRegions, 'us'),
    cn: regionOrDefault(stnRegions, 'cn'),
    gb: regionOrDefault(stnRegions, 'gb'),
  };

  return { sfn, stn };
}

/**
 * Minimal runtime guard for hydrated storage payloads.
 * @param value - Candidate hydrated payload.
 * @returns True when both `sfn.default` and `stn.default` objects exist.
 */
export function isModeConfigData(value: unknown): value is ModeConfigDataModel {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  const sfn = record['sfn'];
  const stn = record['stn'];
  if (sfn === null || typeof sfn !== 'object' || Array.isArray(sfn)) {
    return false;
  }
  if (stn === null || typeof stn !== 'object' || Array.isArray(stn)) {
    return false;
  }
  const sfnRecord = sfn as Record<string, unknown>;
  const stnRecord = stn as Record<string, unknown>;
  return (
    sfnRecord['default'] != null &&
    typeof sfnRecord['default'] === 'object' &&
    stnRecord['default'] != null &&
    typeof stnRecord['default'] === 'object'
  );
}

/**
 * Resolve currency and measurement units for a country within a shipping mode.
 *
 * Unknown country codes fall back to the mode's `default` region — the server
 * record is the source of truth; no client-side region tables.
 *
 * @param config - Loaded {@link ModeConfigDataModel} (from API or storage).
 * @param mode - Active `'stn'` or `'sfn'` branch.
 * @param countryCode - Lower/upper ISO-ish key (`ng`, `us`, …) or empty for default.
 * @returns Region config for the country, or the mode `default` fallback.
 */
export function resolveModeRegionConfig(
  config: ModeConfigDataModel,
  mode: ShippingMode,
  countryCode: string | null | undefined,
): ModeRegionConfigModel {
  const regions: ModeSfnConfigModel | ModeStnConfigModel =
    mode === 'sfn' ? config.sfn : config.stn;

  if (countryCode != null && countryCode !== '') {
    const key = countryCode.toLowerCase();
    if (key !== 'default') {
      const keyed = regions as unknown as Record<
        string,
        ModeRegionConfigModel | undefined
      >;
      const region = keyed[key];
      if (region != null) {
        return region;
      }
    }
  }

  return regions.default;
}
