/**
 * Country and subdivision shapes from public utility endpoints.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names are camelCase in the SDK. Wire payloads may use snake_case
 * (`state_code`); mapping happens once in `@aies/aies-core` CountryService.
 */

/**
 * State / province / region under a {@link CountryModel}.
 */
export interface CountryStateModel {
  /** Display name (e.g. `"Lagos"`, `"California"`). */
  name: string;

  /**
   * Subdivision code for the country (e.g. `"LA"`, `"CA"`).
   * Mapped from wire `state_code`.
   */
  stateCode: string;
}

/**
 * Country record from `GET /public/country/read/{id|all}`.
 */
export interface CountryModel {
  /** Numeric country id from the API. */
  id: number;

  /** Official / display country name. */
  name: string;

  /** ISO 3166-1 alpha-3 code (e.g. `"NGA"`). */
  iso3: string;

  /** ISO 3166-1 alpha-2 code (e.g. `"NG"`). */
  iso2: string;

  /** Nested subdivisions; may be an empty array. */
  states: CountryStateModel[];
}
