/**
 * Form control barrel for `@aies/aies-ui`.
 *
 * Shared AIES form field pattern (label, hint, error, ControlValueAccessor).
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
export { RadioComponent, type RadioOption } from './radio';
export {
  SelectComponent,
  type SelectCreateConfig,
  type SelectOption,
} from './select';
export { TextInputComponent } from './text-input';
export { TextareaComponent } from './textarea';
export { ToggleComponent } from './toggle';
