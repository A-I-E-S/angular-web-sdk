import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  model,
  signal,
  viewChild,
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

let nextNumberInputId = 0;

const numberFormatter = new Intl.NumberFormat('en-US');

/**
 * Formats a raw field string with grouping commas while preserving a trailing
 * decimal point / partial fraction so mid-typing stays natural.
 *
 * @param raw - Whatever is currently in the input (may already contain commas).
 * @returns Display text plus a parseable number (or `null` / `undefined` when
 *   the draft is not yet a complete number — `undefined` means "do not emit").
 */
function formatWhileTyping(raw: string): {
  display: string;
  numeric: number | null | undefined;
} {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '-') {
    return { display: trimmed === '-' ? '-' : '', numeric: null };
  }

  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const dotIndex = unsigned.indexOf('.');
  const hasDot = dotIndex !== -1;
  const intRaw = hasDot ? unsigned.slice(0, dotIndex) : unsigned;
  const fracRaw = hasDot ? unsigned.slice(dotIndex + 1).replace(/[^\d]/g, '') : '';
  const intDigits = intRaw.replace(/[^\d]/g, '');

  // Leading "." → treat as "0."
  const intFormatted =
    intDigits === ''
      ? hasDot
        ? '0'
        : ''
      : numberFormatter.format(Number(intDigits));

  let display = `${negative ? '-' : ''}${intFormatted}`;
  if (hasDot) {
    display += `.${fracRaw}`;
  }

  if (intDigits === '' && !hasDot) {
    return { display, numeric: null };
  }

  // Trailing "." alone is partial — keep display, skip emit until more digits.
  if (hasDot && fracRaw === '' && unsigned.endsWith('.')) {
    return { display, numeric: undefined };
  }

  const parsed = Number(`${negative ? '-' : ''}${intDigits || '0'}${hasDot ? `.${fracRaw}` : ''}`);
  if (Number.isNaN(parsed)) {
    return { display, numeric: undefined };
  }
  return { display, numeric: parsed };
}

/**
 * Numeric field following `libs/aies-ui/docs/form-controls.md`.
 *
 * The public contract is always a plain `number | null` — comma grouping is
 * **display-only** via `Intl.NumberFormat('en-US')`, applied **as the user types**
 * (caret is restored by digit-count so commas do not jump the cursor).
 *
 * @example
 * ```html
 * <!-- Consumers always bind a number, never a formatted string -->
 * <aies-number-input
 *   label="Declared value"
 *   [(value)]="amount"
 * >
 *   <span prefix>$</span>
 * </aies-number-input>
 * ```
 * ```ts
 * amount = signal<number | null>(1250); // UI shows "1,250"
 * ```
 */
@Component({
  selector: 'aies-number-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberInputComponent),
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
        #inputEl
        [id]="controlId"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        [class]="innerClass"
        [value]="displayText()"
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
export class NumberInputComponent implements ControlValueAccessor {
  protected readonly controlId = `aies-number-input-${++nextNumberInputId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly affixClass = FORM_AFFIX_CLASS;
  protected readonly innerClass = FORM_CONTROL_INNER_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  /** Visible field label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /** Native placeholder when empty. */
  readonly placeholder = input('');

  /**
   * Plain number (or `null`). Never a comma-formatted string.
   */
  readonly value = model<number | null>(null);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  /**
   * WHY a separate draft: while typing we may show "1," / "1,250." before the
   * model can round-trip through `Intl.NumberFormat` without fighting the caret.
   */
  private readonly draftText = signal<string | null>(null);

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly displayText = computed(() => {
    const draft = this.draftText();
    if (draft !== null) {
      return draft;
    }
    const v = this.value();
    if (v === null || v === undefined) {
      return '';
    }
    return numberFormatter.format(v);
  });

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

  private onChange: (value: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** @param value - Plain number or `null` (never a formatted string). */
  writeValue(value: number | null): void {
    this.draftText.set(null);
    this.value.set(value);
  }

  /** @param fn - Numeric change callback. */
  registerOnChange(fn: (value: number | null) => void): void {
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
    const el = event.target as HTMLInputElement;
    const raw = el.value;
    const caret = el.selectionStart ?? raw.length;
    const digitsBeforeCaret = countDigits(raw.slice(0, caret));
    const caretAfterDecimal =
      raw.indexOf('.') !== -1 && caret > raw.indexOf('.');
    const fracDigitsBeforeCaret = caretAfterDecimal
      ? countDigits(raw.slice(raw.indexOf('.') + 1, caret))
      : 0;

    const { display, numeric } = formatWhileTyping(raw);
    this.draftText.set(display);
    // Native value must be written — `[value]` does not reliably overwrite mid-input.
    el.value = display;

    if (numeric !== undefined) {
      this.value.set(numeric);
      this.onChange(numeric);
    }

    // Restore caret by digit identity so inserting commas does not jump the cursor.
    const caretPos = caretFromDigitCount(
      display,
      digitsBeforeCaret,
      caretAfterDecimal,
      fracDigitsBeforeCaret,
    );
    queueMicrotask(() => {
      const input = this.inputEl()?.nativeElement ?? el;
      input.setSelectionRange(caretPos, caretPos);
    });
  }

  protected onBlur(): void {
    this.draftText.set(null);
    this.onTouched();
  }
}

/**
 * @param text - Source string.
 * @returns Count of digit characters.
 */
function countDigits(text: string): number {
  return (text.match(/\d/g) ?? []).length;
}

/**
 * Maps a digit-based caret intent back onto a comma-formatted string.
 *
 * @param display - Formatted field text.
 * @param intDigitsWanted - Digits left of caret in the integer portion (or total when no decimal).
 * @param afterDecimal - Whether the caret sits in the fraction.
 * @param fracDigitsWanted - Digits left of caret in the fraction.
 * @returns Caret index into `display`.
 */
function caretFromDigitCount(
  display: string,
  intDigitsWanted: number,
  afterDecimal: boolean,
  fracDigitsWanted: number,
): number {
  const dot = display.indexOf('.');
  if (!afterDecimal || dot === -1) {
    let seen = 0;
    for (let i = 0; i < display.length; i++) {
      const ch = display[i];
      if (ch !== undefined && /\d/.test(ch)) {
        seen++;
        if (seen >= intDigitsWanted) {
          return i + 1;
        }
      }
    }
    return dot === -1 ? display.length : dot;
  }

  let seen = 0;
  for (let i = dot + 1; i < display.length; i++) {
    const ch = display[i];
    if (ch !== undefined && /\d/.test(ch)) {
      seen++;
      if (seen >= fracDigitsWanted) {
        return i + 1;
      }
    }
  }
  return display.length;
}
