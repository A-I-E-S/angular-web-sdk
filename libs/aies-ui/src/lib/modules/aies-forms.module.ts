import { NgModule } from '@angular/core';

import { CheckboxComponent } from '../forms/checkbox';
import { DatePickerComponent } from '../forms/date-picker';
import { FileUploadComponent } from '../forms/file-upload';
import { NumberInputComponent } from '../forms/number-input';
import { OtpInputComponent } from '../forms/otp-input';
import { RadioComponent } from '../forms/radio';
import { SelectComponent } from '../forms/select';
import { TextInputComponent } from '../forms/text-input';
import { TextareaComponent } from '../forms/textarea';
import { ToggleComponent } from '../forms/toggle';

const FORM_CONTROLS = [
  TextInputComponent,
  TextareaComponent,
  NumberInputComponent,
  SelectComponent,
  CheckboxComponent,
  RadioComponent,
  ToggleComponent,
  DatePickerComponent,
  FileUploadComponent,
  OtpInputComponent,
] as const;

/**
 * All form controls in one import for apps that prefer NgModules.
 *
 * Components stay standalone — this module only re-exports them.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesFormsModule],
 * })
 * export class ShipmentFormsModule {}
 * ```
 */
@NgModule({
  imports: [...FORM_CONTROLS],
  exports: [...FORM_CONTROLS],
})
export class AiesFormsModule {}
