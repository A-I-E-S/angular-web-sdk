import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import {
  FORM_AFFIX_CLASS,
  FORM_CONTROL_INNER_CLASS,
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';

let nextTextareaId = 0;

/**
 * Multi-line text field following the shared form-control pattern
 * (`shared AFRICANIES form field pattern`). Supports prefix/suffix slots,
 * field-level `error`, and {@link ControlValueAccessor}.
 *
 * @example
 * ```html
 * <africanies-textarea
 *   label="Notes"
 *   hint="Visible to the warehouse"
 *   [rows]="4"
 *   [(value)]="notes"
 * />
 * ```
 */
@Component({
  selector: 'africanies-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <div [class]="shellClass()">
      <span [class]="affixClass" data-slot="prefix">
        <ng-content select="[prefix]" />
      </span>
      <textarea
        [id]="controlId"
        [class]="innerClass"
        [rows]="rows()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      ></textarea>
      <span [class]="affixClass" data-slot="suffix">
        <ng-content select="[suffix]" />
      </span>
    </div>
    @if (error(); as err) {
      <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
    } @else if (hint(); as h) {
      <p [id]="hintId" [class]="hintClass">{{ h }}</p>
    }
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  protected readonly controlId = `africanies-textarea-${++nextTextareaId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = `${FORM_CONTROL_INNER_CLASS} resize-y min-h-20 h-auto py-2`;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /** Visible field label. */
  readonly label = input('');

  /**
   * Helper copy under the field. Hidden while {@link error} is set.
   */
  readonly hint = input<string | undefined>(undefined);

  /**
   * Field-level validation message. Distinct from `ErrorStateComponent`.
   */
  readonly error = input<string | null>(null);

  /** Native placeholder. */
  readonly placeholder = input('');

  /** Visible row count for the native textarea. */
  readonly rows = input(3, { transform: numberAttribute });

  /** Current text (`[(value)]` + CVA). */
  readonly value = model<string>('');

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly shellClass = computed(() => {
    let classes = `${FORM_FIELD_CLASS} !h-auto min-h-10 items-stretch`;
    if (this.error()) {
      classes += ` ${FORM_FIELD_ERROR_CLASS}`;
    }
    if (this.disabled()) {
      classes += ` ${FORM_DISABLED_CLASS}`;
    }
    return classes;
  });

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.hint()) {
      return this.hintId;
    }
    return null;
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** @param value - Form model; `null` becomes `''`. */
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  /** @param fn - User edit callback. */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /** @param fn - Blur callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @param isDisabled - Blocks editing when true. */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
