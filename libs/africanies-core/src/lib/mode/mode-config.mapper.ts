import type {
  ModeConfigDataModel,
  ModeCurrencyCode,
  ModeDimensionUnit,
  ModeMassUnit,
  ModeRegionConfigModel,
  ModeSfnConfigModel,
  ModeStnConfigModel,
  ShippingMode,
} from '@africanies/africanies-models';

import { asRecord, asString } from '../http/wire';

/** Public mode-config endpoint path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const MODE_CONFIG_PATH = '/public/mode/config';

/** Fallback region when the wire omits a required branch/key. */
const DEFAULT_REGION: ModeRegionConfigModel = {
  dimension_unit: 'cm',
  mass_unit: 'KG',
  currency: 'NGN',
  currency_symbol: '',
};

function asDimensionUnit(value: unknown): ModeDimensionUnit {
  return value === 'inches' ? 'inches' : 'cm';
}

function asMassUnit(value: unknown): ModeMassUnit {
  return value === 'LBS' ? 'LBS' : 'KG';
}

function asCurrency(value: unknown): ModeCurrencyCode {
  return value === 'USD' ? 'USD' : 'NGN';
}

/**
 * Map a region object into {@link ModeRegionConfigModel} (snake_case).
 * @param raw
 */
export function mapRegionConfig(raw: unknown): ModeRegionConfigModel {
  const record = asRecord(raw) ?? {};
  return {
    dimension_unit: asDimensionUnit(
      record['dimension_unit'] ?? record['dimensionUnit'],
    ),
    mass_unit: asMassUnit(record['mass_unit'] ?? record['massUnit']),
    currency: asCurrency(record['currency']),
    currency_symbol: asString(
      record['currency_symbol'] ?? record['currencySymbol'],
    ),
  };
}

/**
 * Map every region entry under a mode branch (`default`, `ng`, `us`, …).
 * @param modeRaw
 */
export function mapModeRegions(
  modeRaw: unknown,
): Record<string, ModeRegionConfigModel> {
  const mode = asRecord(modeRaw) ?? {};
  const out: Record<string, ModeRegionConfigModel> = {};
  for (const [key, value] of Object.entries(mode)) {
    out[key] = mapRegionConfig(value);
  }
  return out;
}

function regionOrDefault(
  regions: Record<string, ModeRegionConfigModel>,
  key: string,
): ModeRegionConfigModel {
  return regions[key] ?? regions['default'] ?? { ...DEFAULT_REGION };
}

/**
 * Deep-map mode config preserving snake_case region fields.
 * @param raw
 */
export function mapModeConfigData(
  raw: ModeConfigDataModel | Record<string, unknown>,
): ModeConfigDataModel {
  const record = asRecord(raw) ?? {};
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
 * @param value
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
 * @param config
 * @param mode
 * @param countryCode
 */
export function resolveModeRegionConfig(
  config: ModeConfigDataModel | null | undefined,
  mode: ShippingMode,
  countryCode: string | null | undefined,
): ModeRegionConfigModel {
  const regions = mode === 'sfn' ? config?.sfn : config?.stn;
  const keyed = (regions ?? {}) as unknown as Record<
    string,
    ModeRegionConfigModel | undefined
  >;

  if (countryCode != null && countryCode !== '') {
    const key = asString(countryCode).toLowerCase();
    if (key !== 'default') {
      const region = keyed[key];
      if (region != null) {
        return region;
      }
    }
  }

  return keyed['default'] ?? { ...DEFAULT_REGION };
}
