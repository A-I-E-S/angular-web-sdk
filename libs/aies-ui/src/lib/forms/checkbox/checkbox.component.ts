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

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
} from '../form-field.classes';

let nextCheckboxId = 0;

/**
 * Boolean checkbox following `libs/aies-ui/docs/form-controls.md`.
 *
 * **Prefix/suffix slots are omitted** — a checkbox is a binary control with a
 * label; affix projection does not apply.
 *
 * Custom painted control so the check glyph stays **white** on the mode
 * primary fill (SFN green / STN orange).
 *
 * @example
 * ```html
 * <aies-checkbox
 *   label="I agree to the terms"
 *   hint="Required to continue"
 *   [(value)]="accepted"
 * />
 * ```
 */
@Component({
  selector: 'aies-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex max-w-full',
  },
  imports: [AiesIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <div class="inline-flex max-w-full flex-col gap-1.5">
      <label
        [attr.for]="controlId"
        class="inline-flex items-center gap-2.5 text-body text-ink dark:text-white"
        [class.opacity-50]="disabled()"
        [class.cursor-pointer]="!disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        <span class="relative inline-flex size-4 shrink-0">
          <input
            [id]="controlId"
            type="checkbox"
            class="peer absolute inset-0 z-10 m-0 size-full opacity-0"
            [class.cursor-pointer]="!disabled()"
            [class.cursor-not-allowed]="disabled()"
            [checked]="value()"
            [disabled]="disabled()"
            [attr.aria-invalid]="error() ? true : null"
            [attr.aria-describedby]="describedBy()"
            (change)="onChangeEvent($event)"
            (blur)="onBlur()"
          />
          <span [class]="markClass()" aria-hidden="true">
            @if (value()) {
              <aies-icon name="check" [size]="12" class="text-white" />
            }
          </span>
        </span>
        <span class="text-body leading-5">{{ label() }}</span>
      </label>
      @if (error(); as err) {
        <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
      } @else if (hint(); as h) {
        <p [id]="hintId" [class]="hintClass">{{ h }}</p>
      }
    </div>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  private readonly modeColor = inject(ModeColorService);

  protected readonly controlId = `aies-checkbox-${++nextCheckboxId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /** Visible label beside the checkbox. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /** Checked state (`[(value)]` + CVA). */
  readonly value = model(false);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  protected readonly markClass = computed(() => {
    const base =
      'pointer-events-none flex size-4 items-center justify-center rounded border text-white transition-colors ' +
      'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink';
    const err = this.error() ? ' !border-danger dark:!border-danger' : '';
    if (this.value()) {
      const c = this.modeColor.classes();
      return `${base} ${c.bg} ${c.border}${err}`;
    }
    return `${base} border-neutral-400 bg-white dark:border-white/40 dark:bg-ink-950${err}`;
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

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** @param value - Form model; non-boolean coerces via `!!`. */
  writeValue(value: boolean | null): void {
    this.value.set(!!value);
  }

  /** @param fn - User change callback. */
  registerOnChange(fn: (value: boolean) => void): void {
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

  protected onChangeEvent(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value.set(checked);
    this.onChange(checked);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
