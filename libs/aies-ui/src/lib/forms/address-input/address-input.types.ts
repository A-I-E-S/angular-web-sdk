/**
 * Types for {@link AddressInputComponent} and Google Places integration.
 */

/**
 * Bootstrap config for Places API (New) REST autocomplete.
 */
export interface GooglePlacesConfig {
  /**
   * API key with Places API (New) enabled. Sent as `X-Goog-Api-Key`.
   */
  apiKey: string;

  /**
   * Optional language code for predictions / details (e.g. `en`, `fr`).
   */
  language?: string;

  /**
   * Optional region restriction (ISO-3166-1 alpha-2, e.g. `ng`, `gh`)
   * used when the field does not pass `countries`.
   */
  region?: string;
}

/**
 * One autocomplete suggestion before place details are fetched.
 */
export interface AddressPrediction {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
}

/**
 * Structured place returned by CVA / `[(value)]` and `(placeSelected)`.
 */
export interface AddressPlace {
  placeId: string;
  formattedAddress: string;
  name?: string;
  lat?: number;
  lng?: number;
  streetNumber?: string;
  route?: string;
  locality?: string;
  administrativeAreaLevel1?: string;
  /**
   * ISO-3166-2 subdivision code when Google provides one (`LA` for Lagos).
   */
  administrativeAreaLevel1Code?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  addressComponents?: AddressComponent[];
}

/**
 * One entry from Google `address_components`.
 */
export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}
