import { NgClass } from '@angular/common';
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

import { ModeColorService } from '@aies/aies-theme';

import {
  FORM_ERROR_CLASS,
  FORM_HINT_CLASS,
} from '../form-field.classes';

let nextToggleId = 0;

/**
 * Boolean switch following the shared AIES form field pattern.
 *
 * **Prefix/suffix slots are omitted** — a toggle is a binary control; affix
 * projection does not apply.
 *
 * On-state fill follows {@link ModeColorService} (SFN green / STN orange).
 *
 * @example
 * ```html
 * <aies-toggle label="Notify on arrival" [(value)]="notify" />
 * ```
 */
@Component({
  selector: 'aies-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-1.5">
      <label
        [attr.for]="controlId"
        class="inline-flex items-center gap-3 text-body text-ink dark:text-white"
        [class.opacity-50]="disabled()"
        [class.cursor-pointer]="!disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        <button
          [id]="controlId"
          type="button"
          role="switch"
          class="inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border p-0.5 box-border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:border-white/15"
          [ngClass]="trackClass()"
          [attr.aria-checked]="value()"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy()"
          [disabled]="disabled()"
          (click)="toggle()"
          (blur)="onBlur()"
        >
          <span
            class="pointer-events-none block size-3.5 shrink-0 rounded-full bg-white shadow transition-transform duration-200 ease-out"
            [class.translate-x-[1.125rem]]="value()"
            [class.translate-x-0]="!value()"
          ></span>
        </button>
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
export class ToggleComponent implements ControlValueAccessor {
  private readonly modeColor = inject(ModeColorService);

  protected readonly controlId = `aies-toggle-${++nextToggleId}`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  /** Visible label beside the switch. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. Distinct from `ErrorStateComponent`. */
  readonly error = input<string | null>(null);

  /** On/off state (`[(value)]` + CVA). */
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

  /** On → mode primary fill; off → neutral track. */
  protected readonly trackClass = computed(() =>
    this.value()
      ? this.modeColor.classes().bg
      : 'bg-neutral-300 dark:bg-neutral-600',
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

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  /** @param value - Form model; non-boolean coerces via `!!`. */
  writeValue(value: boolean | null): void {
    this.value.set(!!value);
  }

  /** @param fn - User toggle callback. */
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

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    const next = !this.value();
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
