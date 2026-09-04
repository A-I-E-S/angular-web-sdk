import { NgClass } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { ModeColorService } from '@africanies/africanies-theme';

import { FORM_ERROR_CLASS, FORM_HINT_CLASS } from '../form-field.classes';

let nextToggleId = 0;

/**
 * Boolean switch following the shared AFRICANIES form field pattern.
 *
 * **Prefix/suffix slots are omitted** — a toggle is a binary control; affix
 * projection does not apply.
 *
 * On-state fill follows {@link ModeColorService} (SFN green / STN orange).
 *
 * The thumb follows {@link value} (or the CVA model). A click emits the next
 * boolean and does not flip locally — so `[(value)]` stays instant while
 * one-way `[value]` + `(valueChange)` waits for the parent to commit. Bind
 * {@link loading} for API-backed switches: the control stays on the last
 * committed value, shows a spinner, and ignores further clicks.
 *
 * @example
 * ```html
 * <africanies-toggle label="Notify on arrival" [(value)]="notify" />
 *
 * <africanies-toggle
 *   label="Active"
 *   [value]="row.active"
 *   [loading]="savingId() === row.id"
 *   (valueChange)="saveActive(row, $event)"
 * />
 * ```
 */
@Component({
  selector: 'africanies-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, NgClass],
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
        [class.opacity-50]="disabled() && !loading()"
        [class.cursor-pointer]="!inactive()"
        [class.cursor-not-allowed]="disabled() && !loading()"
        [class.cursor-wait]="loading()"
      >
        <button
          [id]="controlId"
          type="button"
          role="switch"
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border p-0.5 box-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink dark:border-white/15"
          [ngClass]="trackClass()"
          [attr.aria-checked]="on()"
          [attr.aria-busy]="loading() ? true : null"
          [attr.aria-invalid]="error() ? true : null"
          [attr.aria-describedby]="describedBy()"
          [disabled]="inactive()"
          (click)="toggle()"
          (blur)="onBlur()"
        >
          <span
            class="pointer-events-none relative block size-3.5 shrink-0 rounded-full bg-white shadow transition-transform duration-200 ease-out"
            [ngClass]="on() ? 'translate-x-4' : 'translate-x-0'"
          >
            @if (loading()) {
              <africanies-icon
                name="spinner"
                [size]="12"
                class="absolute inset-0 m-auto animate-spin text-ink"
                aria-hidden="true"
              />
            }
          </span>
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

  protected readonly controlId = `africanies-toggle-${++nextToggleId}`;
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
  readonly value = input(false);

  /** Emitted with the intended next state. The thumb flips when {@link value} changes. */
  readonly valueChange = output<boolean>();

  /**
   * In-flight mutation. Keeps the last committed {@link value}, shows a
   * spinner on the thumb, and treats the switch as non-interactive.
   *
   * Plain boolean (no `booleanAttribute`): `[loading]="saving()"` bindings
   * must pass through `true` without attribute-string coercion.
   */
  readonly loading = input(false);

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  protected readonly cvaDisabled = signal(false);
  /**
   * Form-attached value. `undefined` until {@link writeValue} runs so
   * template `[value]` stays the source of truth outside reactive forms.
   */
  private readonly cvaValue = signal<boolean | undefined>(undefined);

  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );
  protected readonly inactive = computed(
    () => this.disabled() || this.loading(),
  );
  protected readonly on = computed(() => {
    const fromCva = this.cvaValue();
    return fromCva !== undefined ? fromCva : this.value();
  });

  /** On → mode primary fill; off → neutral track. */
  protected readonly trackClass = computed(() =>
    this.on()
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
    this.cvaValue.set(!!value);
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
    if (this.inactive()) {
      return;
    }
    const next = !this.on();
    this.onChange(next);
    this.valueChange.emit(next);
    // Forms do not writeValue back after onChange — keep the thumb in sync.
    if (this.cvaValue() !== undefined) {
      this.cvaValue.set(next);
    }
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
