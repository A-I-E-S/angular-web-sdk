import type { CountryModel, CountryStateModel } from '@aies/aies-models';

/** Public country-read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const COUNTRY_READ_PATH = '/public/country/read';

/**
 * Map a wire state object into {@link CountryStateModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - State object from the wire (camel or snake case).
 * @returns Normalized {@link CountryStateModel}.
 */
export function mapCountryState(raw: unknown): CountryStateModel {
  const record = (raw ?? {}) as Record<string, unknown>;
  return {
    name: String(record['name'] ?? ''),
    stateCode: String(record['stateCode'] ?? record['state_code'] ?? ''),
  };
}

/**
 * Map a wire country object into {@link CountryModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - Country object from the wire (camel or snake case).
 * @returns Normalized {@link CountryModel}.
 */
export function mapCountry(raw: unknown): CountryModel {
  const record =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const statesRaw = record['states'];
  const states = Array.isArray(statesRaw)
    ? statesRaw.map((entry) => mapCountryState(entry))
    : [];

  const id = Number(record['id'] ?? 0);
  return {
    id: Number.isFinite(id) ? id : 0,
    name: String(record['name'] ?? ''),
    iso3: String(record['iso3'] ?? ''),
    iso2: String(record['iso2'] ?? ''),
    states,
  };
}

/**
 * Map a list (or single object) payload into {@link CountryModel}[].
 *
 * Some by-id responses may still arrive as a single object; normalize to an
 * array so callers always get `CountryModel[]`.
 *
 * @param raw - `data` payload from `/public/country/read/{id|all}`.
 * @returns Mapped country list (empty when `raw` is null/undefined).
 */
export function mapCountryList(raw: unknown): CountryModel[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapCountry(entry));
  }
  return [mapCountry(raw)];
}
