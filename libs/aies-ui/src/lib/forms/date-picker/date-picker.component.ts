import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { ThemeService } from '@aies/aies-theme';

import {
  FORM_AFFIX_CLASS,
  FORM_DATE_INNER_CLASS,
  FORM_DISABLED_CLASS,
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';

let nextDatePickerId = 0;

/**
 * Date field wrapping native `input[type=date]`, following
 * `libs/aies-ui/docs/form-controls.md`.
 *
 * Value is an ISO calendar date string (`YYYY-MM-DD`) or `null` — matching the
 * native control — not a `Date` object (avoids timezone surprises).
 *
 * Clicking anywhere on the field shell calls `HTMLInputElement.showPicker()`
 * so the calendar opens without hunting for the tiny indicator glyph.
 *
 * Dark calendar chrome follows `color-scheme` from {@link ThemeService}
 * (document + this input). Supports prefix/suffix slots.
 *
 * @example
 * ```html
 * <aies-date-picker
 *   label="Pickup date"
 *   [(value)]="pickupDate"
 * >
 *   <aies-icon prefix name="calendar" [size]="16" />
 * </aies-date-picker>
 * ```
 */
@Component({
  selector: 'aies-date-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    <label [attr.for]="controlId" [class]="labelClass">{{ label() }}</label>
    <div
      [class]="shellClass()"
      [class.cursor-pointer]="!disabled()"
    >
      <span [class]="affixClass" data-slot="prefix">
        <ng-content select="[prefix]" />
      </span>
      <input
        #dateInput
        [id]="controlId"
        type="date"
        [class]="innerClass"
        [style.color-scheme]="colorScheme()"
        [value]="value() ?? ''"
        [disabled]="disabled()"
        [attr.min]="min() || null"
        [attr.max]="max() || null"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()"
        (click)="openPicker($event)"
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
export class DatePickerComponent implements ControlValueAccessor {
  private readonly theme = inject(ThemeService, { optional: true });

  protected readonly controlId = `aies-date-picker-${++nextDatePickerId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = FORM_DATE_INNER_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  private readonly dateInput =
    viewChild<ElementRef<HTMLInputElement>>('dateInput');

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /** Optional native `min` (`YYYY-MM-DD`). */
  readonly min = input<string | undefined>(undefined);

  /** Optional native `max` (`YYYY-MM-DD`). */
  readonly max = input<string | undefined>(undefined);

  /** ISO date string or `null` (`[(value)]` + CVA). */
  readonly value = model<string | null>(null);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  /** Native picker chrome — mirrors app theme when ThemeService is present. */
  protected readonly colorScheme = computed(
    () => this.theme?.theme() ?? 'light',
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

  private onChange: (value: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** @param value - ISO date or `null`. */
  writeValue(value: string | null): void {
    this.value.set(value);
  }

  /** @param fn - User edit callback. */
  registerOnChange(fn: (value: string | null) => void): void {
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

  /**
   * Opens the native calendar on input click.
   * Uses `showPicker()` when available (Chromium, Safari 16+, Firefox 101+).
   *
   * @param event - Click from the input.
   */
  protected openPicker(event?: Event): void {
    if (this.disabled()) {
      return;
    }
    event?.stopPropagation();
    const el = this.dateInput()?.nativeElement;
    if (!el || typeof el.showPicker !== 'function') {
      return;
    }
    try {
      el.showPicker();
    } catch {
      // showPicker throws if not tied to a user gesture or if the input is not
      // rendered — ignore and leave native indicator behavior as fallback.
    }
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const next = raw === '' ? null : raw;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
