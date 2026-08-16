import type { CountryModel, CountryStateModel } from '@aies/aies-models';

import {
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
} from '../http/wire';

/** Public country-read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const COUNTRY_READ_PATH = '/public/country/read';

/**
 * Map a wire state object into {@link CountryStateModel} (snake_case preserved).
 * @param raw - State object from the wire.
 * @returns Normalized {@link CountryStateModel}.
 */
export function mapCountryState(raw: unknown): CountryStateModel {
  const record = asRecord(raw) ?? {};
  return {
    name: asString(record['name']),
    state_code: asString(record['state_code'] ?? record['stateCode']),
  };
}

/**
 * Map a wire country object into {@link CountryModel} (snake_case preserved).
 * @param raw - Country object from the wire.
 * @returns Normalized {@link CountryModel}.
 */
export function mapCountry(raw: unknown): CountryModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    iso3: asString(record['iso3']),
    iso2: asString(record['iso2']),
    states: mapArray(record['states'], mapCountryState),
  };
}

/**
 * Map a list (or single object) payload into {@link CountryModel}[].
 *
 * @param raw - `data` payload from `/public/country/read/{id|all}`.
 * @returns Mapped country list (empty when `raw` is null/undefined).
 */
export function mapCountryList(raw: unknown): CountryModel[] {
  return mapList(raw, mapCountry);
}
