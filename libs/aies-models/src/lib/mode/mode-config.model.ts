import type { ShippingMode } from '../shipping/shipping-mode.model';

/**
 * Linear dimension unit used when displaying or validating package sizes.
 */
export type ModeDimensionUnit = 'cm' | 'inches';

/**
 * Mass unit used when displaying or validating package weight.
 */
export type ModeMassUnit = 'KG' | 'LBS';

/**
 * Supported currency codes for mode/region pricing display.
 * Extend this union as additional currencies are onboarded.
 */
export type ModeCurrencyCode = 'NGN' | 'USD';

/**
 * App-type selector when resolving region config.
 * Alias of {@link ShippingMode} — same `'stn' | 'sfn'` values, named for
 * mode-config APIs that speak in terms of app type rather than shipping mode.
 */
export type ModeAppType = ShippingMode;

/**
 * Region-specific display units and currency for a shipping mode.
 *
 * Field names are camelCase in the SDK even though the wire format is
 * snake_case — mapping happens once at the API client / service boundary.
 */
export interface ModeRegionConfigModel {
  /** Unit for package length/width/height in this region. */
  dimensionUnit: ModeDimensionUnit;

  /** Unit for package weight in this region. */
  massUnit: ModeMassUnit;

  /** ISO-like currency code used for amounts in this region. */
  currency: ModeCurrencyCode;

  /**
   * Display symbol for `currency` (e.g. `'₦'`, `'$'`).
   * Kept as a string so backends can ship locale-specific glyphs without SDK changes.
   */
  currencySymbol: string;
}

/**
 * Region map for Ship-From-Nigeria (`sfn`) mode.
 *
 * Intentionally only keys `default` and `ng` — SFN serves Nigerian outbound
 * flows, not the STN country set. Do not force a shared key union with
 * {@link ModeStnConfigModel}; the asymmetry mirrors real business regions.
 */
export interface ModeSfnConfigModel {
  /** Fallback region config when a country code is missing or unrecognized. */
  default: ModeRegionConfigModel;

  /** Nigeria-specific region config. */
  ng: ModeRegionConfigModel;
}

/**
 * Region map for Ship-To-Nigeria (`stn`) mode.
 *
 * Intentionally keys `default`, `us`, `cn`, and `gb` — STN covers major
 * origin markets for inbound-to-Nigeria shipping. Different from
 * {@link ModeSfnConfigModel}'s `ng`-only country key by design.
 */
export interface ModeStnConfigModel {
  /** Fallback region config when a country code is missing or unrecognized. */
  default: ModeRegionConfigModel;

  /** United States region config. */
  us: ModeRegionConfigModel;

  /** China region config. */
  cn: ModeRegionConfigModel;

  /** Great Britain region config. */
  gb: ModeRegionConfigModel;
}

/**
 * Full public mode-config payload: units/currency metadata per shipping mode.
 *
 * Fetched from `/public/mode/config` (wrapped envelope with success/data/
 * statusCode; typically no errors/pagination).
 */
export interface ModeConfigDataModel {
  /** Region configs for Ship-From-Nigeria. */
  sfn: ModeSfnConfigModel;

  /** Region configs for Ship-To-Nigeria. */
  stn: ModeStnConfigModel;
}
