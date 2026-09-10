/**
 * Phone input form control exports.
 */
export { PHONE_DIAL_CODES, PHONE_MAX_NATIONAL_DIGITS, PHONE_MIN_NATIONAL_DIGITS } from './phone-codes';
export { PhoneInputComponent } from './phone-input.component';
export type { PhoneCountryOption, PhoneNumberValue } from './phone-input.types';
export {
  buildPhoneNumberValue,
  dialCodeForIso2,
  formatNationalDigits,
  isPhoneNumberComplete,
  matchDialCode,
  normalizePhoneIso2,
  parsePhoneControlValue,
  phoneCountryName,
  phoneCountryOptions,
  phoneDigitsOnly,
  phoneToE164,
  removeDialCode,
} from './phone-input.utils';
