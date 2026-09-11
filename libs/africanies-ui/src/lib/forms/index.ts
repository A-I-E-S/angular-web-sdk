/**
 * Form control barrel for `@africanies/africanies-ui`.
 *
 * Shared AFRICANIES form field pattern (label, hint, error, ControlValueAccessor).
 */

export {
  type AddressComponent,
  AddressInputComponent,
  type AddressPlace,
  type AddressPrediction,
  GOOGLE_PLACES_CONFIG,
  type GooglePlacesConfig,
  GooglePlacesService,
  provideGooglePlaces,
} from './address-input';
export { CheckboxComponent } from './checkbox';
export { DatePickerComponent } from './date-picker';
export {
  acceptLabels,
  fileExtensionLabel,
  fileMatchesAccept,
  FileUploadComponent,
  type FileUploadResult,
  type FileUploadVariant,
} from './file-upload';
export { NumberInputComponent } from './number-input';
export { OtpInputComponent, type OtpInputVariant } from './otp-input';
export {
  buildPhoneNumberValue,
  dialCodeForIso2,
  formatNationalDigits,
  isPhoneNumberComplete,
  matchDialCode,
  normalizePhoneIso2,
  parsePhoneControlValue,
  PHONE_DIAL_CODES,
  PHONE_MAX_NATIONAL_DIGITS,
  PHONE_MIN_NATIONAL_DIGITS,
  phoneCountryName,
  type PhoneCountryOption,
  phoneCountryOptions,
  phoneDigitsOnly,
  PhoneInputComponent,
  type PhoneNumberValue,
  phoneToE164,
  removeDialCode,
} from './phone-input';
export { RadioComponent, type RadioOption } from './radio';
export {
  type SearchComboboxBadge,
  type SearchComboboxBadgeFn,
  SearchComboboxComponent,
  type SearchComboboxLabelFn,
  type SearchComboboxMarkFn,
  type SearchComboboxSearchFn,
  type SearchComboboxSubtitleFn,
  type SearchComboboxTrackFn,
} from './search-combobox';
export {
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
  type SelectSize,
} from './select';
export { TextInputComponent, type TextInputType } from './text-input';
export { TextareaComponent } from './textarea';
export { ToggleComponent } from './toggle';
