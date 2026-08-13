/**
 * Types for {@link AddressInputComponent} and Google Places integration.
 */

/**
 * Bootstrap config for loading the Google Maps JavaScript API (Places library).
 */
export interface GooglePlacesConfig {
  /**
   * Google Maps JavaScript API key with Places API enabled.
   */
  apiKey: string;

  /**
   * Optional language code for predictions / details (e.g. `en`, `fr`).
   */
  language?: string;

  /**
   * Optional region bias (ccTLD, e.g. `ng`, `gh`).
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
