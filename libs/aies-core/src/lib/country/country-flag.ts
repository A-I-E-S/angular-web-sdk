import type { CountryModel } from '@aies/aies-models';

/** Default CDN for ISO country flags ([flagcdn.com](https://flagcdn.com)). */
export const COUNTRY_FLAG_CDN_BASE = 'https://flagcdn.com';

/** Image format supported by the flag CDN. */
export type CountryFlagFormat = 'png' | 'webp' | 'jpg' | 'svg';

/**
 * Options for {@link countryFlagUrl}.
 */
export interface CountryFlagUrlOptions {
  /** Pixel width (`w{width}` on flagcdn). Default `40`. */
  width?: number;
  /** Pixel height (`h{height}` on flagcdn). Used instead of {@link width} when set. */
  height?: number;
  /** Image format. Default `'png'`. */
  format?: CountryFlagFormat;
}

/**
 * Select row shape for country pickers (maps cleanly to {@link SelectOption.prefixImageUrl} in UI).
 */
export interface CountrySelectOption {
  label: string;
  value: number;
  iso2: string;
  prefixImageUrl: string;
}

/**
 * Build a flagcdn.com URL from an ISO 3166-1 alpha-2 code.
 *
 * Examples:
 * - `countryFlagUrl('NG')` → `https://flagcdn.com/w40/ng.png`
 * - `countryFlagUrl('us', { width: 80, format: 'webp' })` → `https://flagcdn.com/w80/us.webp`
 *
 * @param iso2 - Two-letter country code (case-insensitive).
 * @param options - Width, height, or format overrides.
 * @returns CDN URL, or `''` when `iso2` is not two letters.
 */
export function countryFlagUrl(
  iso2: string,
  options: CountryFlagUrlOptions = {},
): string {
  const code = iso2.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(code)) {
    return '';
  }

  const format = options.format ?? 'png';
  if (options.height != null) {
    return `${COUNTRY_FLAG_CDN_BASE}/h${options.height}/${code}.${format}`;
  }

  const width = options.width ?? 40;
  return `${COUNTRY_FLAG_CDN_BASE}/w${width}/${code}.${format}`;
}

/**
 * Map {@link CountryModel} rows into select options with flag CDN URLs.
 *
 * @param countries - Countries from {@link CountryService.readAll} / `readPage`.
 * @param options - Passed through to {@link countryFlagUrl}.
 */
export function mapCountrySelectOptions(
  countries: CountryModel[] | null | undefined,
  options?: CountryFlagUrlOptions,
): CountrySelectOption[] {
  if (!countries?.length) {
    return [];
  }

  return countries.map((country) => ({
    label: country.name,
    value: country.id,
    iso2: country.iso2,
    prefixImageUrl: countryFlagUrl(country.iso2, options),
  }));
}
