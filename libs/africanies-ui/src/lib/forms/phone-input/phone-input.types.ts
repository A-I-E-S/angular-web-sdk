/**
 * Structured phone value — same shape as classic `ngx-intl-tel-input` output
 * (`PhoneNumberFormat` in legacy import-export apps).
 *
 * Prefer {@link PhoneNumberValue.e164Number} for API payloads.
 */
export interface PhoneNumberValue {
  /** National digits as typed (may include spaces). */
  number: string;

  /** International display, e.g. `+234 801 234 5678`. */
  internationalNumber: string;

  /** National display, e.g. `0801 234 5678`. */
  nationalNumber: string;

  /** Canonical wire form, e.g. `+2348012345678`. */
  e164Number: string;

  /** ISO 3166-1 alpha-2, e.g. `NG`. */
  countryCode: string;

  /** Dial prefix including `+`, e.g. `+234`. */
  dialCode: string;
}

/**
 * Country row for the phone dial-code picker.
 */
export interface PhoneCountryOption {
  iso2: string;
  dialCode: string;
  name: string;
  flagUrl: string;
}
