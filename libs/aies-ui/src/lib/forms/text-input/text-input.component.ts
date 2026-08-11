import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
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

let nextTextInputId = 0;

/**
 * Single-line text field — **reference** form control for `@aies/aies-ui`.
 *
 * Follows `libs/aies-ui/docs/form-controls.md`: label, hint, field-level
 * `error` (distinct from `ErrorStateComponent`), prefix/suffix projection
 * slots, and {@link ControlValueAccessor} plus `value` / `valueChange` for
 * template bindings.
 *
 * @example
 * ```html
 * <aies-text-input
 *   label="Tracking number"
 *   hint="As printed on the airway bill"
 *   [error]="errors.tracking"
 *   [(value)]="tracking"
 * >
 *   <aies-icon prefix name="search" [size]="16" />
 *   <button suffix type="button" (click)="tracking.set('')">Clear</button>
 * </aies-text-input>
 *
 * <aies-text-input label="Email" formControlName="email" />
 * ```
 */
@Component({
  selector: 'aies-text-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
  ],
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <div [class]="shellClass()">
      <span [class]="affixClass" data-slot="prefix">
        <ng-content select="[prefix]" />
      </span>
      <input
        [id]="controlId"
        type="text"
        [class]="innerClass"
        [value]="value()"
        [disabled]="disabled()"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
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
export class TextInputComponent implements ControlValueAccessor {
  /** Stable ids so label / aria-describedby stay paired across re-renders. */
  protected readonly controlId = `aies-text-input-${++nextTextInputId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = FORM_CONTROL_INNER_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /**
   * Visible field label.
   */
  readonly label = input('');

  /**
   * Helper copy under the field. Hidden while {@link error} is set (error
   * replaces hint visually).
   */
  readonly hint = input<string | undefined>(undefined);

  /**
   * Field-level validation message (`string | null`). Not an async page error —
   * use `ErrorStateComponent` for failed fetches.
   */
  readonly error = input<string | null>(null);

  /**
   * Native placeholder when the value is empty.
   */
  readonly placeholder = input('');

  /**
   * Current text. Supports `[(value)]` and Reactive Forms via CVA.
   */
  readonly value = model<string>('');

  /**
   * Optional host disable (in addition to CVA `setDisabledState`).
   */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly shellClass = computed(() => {
    let classes = FORM_FIELD_CLASS;
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

  /**
   * @param value - Form model value; `null` becomes `''`.
   */
  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  /**
   * @param fn - Called when the user edits the field.
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * @param fn - Called on blur.
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * @param isDisabled - When true, blocks editing.
   */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
