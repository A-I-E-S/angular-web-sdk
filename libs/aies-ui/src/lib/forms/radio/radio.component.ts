import { ModeColorService } from '@aies/aies-theme';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';

/**
 * Option row for {@link RadioComponent}.
 *
 * @typeParam T - Value type bound through CVA / `value`.
 */
export interface RadioOption<T = string> {
  /** Visible label for the radio. */
  label: string;
  /** Value written when this option is selected. */
  value: T;
  /** When true, the option cannot be chosen. */
  disabled?: boolean;
}

let nextRadioId = 0;

/**
 * Radio group following `libs/aies-ui/docs/form-controls.md`.
 *
 * **Prefix/suffix slots are omitted** — radios are mutually exclusive options
 * with labels; affix projection does not apply.
 *
 * Selected ring and center disc follow {@link ModeColorService}
 * (SFN green / STN orange).
 *
 * @typeParam T - Option value type.
 *
 * @example
 * ```html
 * <aies-radio
 *   label="Shipment mode"
 *   [options]="modeOptions"
 *   [(value)]="mode"
 * />
 * ```
 */
@Component({
  selector: 'aies-radio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex max-w-full',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    },
  ],
  template: `
    <fieldset
      class="m-0 p-0 border-0 min-w-0"
      [attr.aria-invalid]="error() ? true : null"
      [attr.aria-describedby]="describedBy()"
    >
      <legend [class]="labelClass">{{ label() }}</legend>
      <div class="flex flex-row flex-wrap gap-x-4 gap-y-2" role="radiogroup">
        @for (opt of options(); track trackOption(opt)) {
          <label
            class="inline-flex items-center gap-2.5 text-body text-ink dark:text-white"
            [class.opacity-50]="disabled() || opt.disabled"
            [class.cursor-pointer]="!(disabled() || opt.disabled)"
            [class.cursor-not-allowed]="disabled() || opt.disabled"
          >
            <span class="relative inline-flex size-4 shrink-0">
              <input
                type="radio"
                class="peer absolute inset-0 z-10 m-0 size-full opacity-0"
                [class.cursor-pointer]="!(disabled() || opt.disabled)"
                [class.cursor-not-allowed]="disabled() || opt.disabled"
                [name]="groupName"
                [checked]="isSelected(opt)"
                [disabled]="disabled() || !!opt.disabled"
                (change)="select(opt)"
                (blur)="onBlur()"
              />
              <span [class]="markClass(opt)" aria-hidden="true">
                @if (isSelected(opt)) {
                  <span [class]="dotClass()"></span>
                }
              </span>
            </span>
            <span>{{ opt.label }}</span>
          </label>
        }
      </div>
      @if (error(); as err) {
        <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
      } @else if (hint(); as h) {
        <p [id]="hintId" [class]="hintClass">{{ h }}</p>
      }
    </fieldset>
  `,
})
export class RadioComponent<T = string> implements ControlValueAccessor {
  private readonly modeColor = inject(ModeColorService);

  protected readonly groupName = `aies-radio-${++nextRadioId}`;
  protected readonly hintId = `${this.groupName}-hint`;
  protected readonly errorId = `${this.groupName}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /** Group legend / label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /** Options rendered as radios. */
  readonly options = input<RadioOption<T>[]>([]);

  /** Selected option value (`[(value)]` + CVA). */
  readonly value = model<T | null>(null);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return this.errorId;
    }
    if (this.hint()) {
      return this.hintId;
    }
    return null;
  });

  private onChange: (value: T | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected trackOption(opt: RadioOption<T>): string {
    return String(opt.value);
  }

  protected isSelected(opt: RadioOption<T>): boolean {
    return Object.is(this.value(), opt.value);
  }

  protected markClass(opt: RadioOption<T>): string {
    const base =
      'pointer-events-none flex size-4 items-center justify-center rounded-full border-2 bg-transparent transition-colors ' +
      'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink';
    const err = this.error() ? ' !border-danger dark:!border-danger' : '';
    if (this.isSelected(opt)) {
      // Ring uses mode accent; fill stays transparent so the center dot reads clearly.
      return `${base} ${this.modeColor.classes().border}${err}`;
    }
    return `${base} border-neutral-400 dark:border-white${err}`;
  }

  /** Selected inner disc — SFN green / STN orange. */
  protected readonly dotClass = computed(
    () =>
      `block size-1.5 rounded-full ${this.modeColor.classes().bg}`,
  );

  /** @param value - Selected option value or `null`. */
  writeValue(value: T | null): void {
    this.value.set(value);
  }

  /** @param fn - Selection change callback. */
  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  /** @param fn - Blur callback. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** @param isDisabled - Blocks interaction when true. */
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected select(opt: RadioOption<T>): void {
    if (this.disabled() || opt.disabled) {
      return;
    }
    this.value.set(opt.value);
    this.onChange(opt.value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
