import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  OnDestroy,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import {
  type ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { ButtonComponent } from '../../button/button.component';
import {
  FORM_ERROR_CLASS,
  FORM_FIELD_ERROR_CLASS,
  FORM_HINT_CLASS,
  FORM_LABEL_CLASS,
} from '../form-field.classes';

let nextOtpId = 0;

/**
 * One-time-passcode field — discrete digit cells, single string model.
 *
 * **Prefix/suffix slots are omitted** — OTP is a fixed-length code entry, not
 * a free-text field with affixes.
 *
 * Digits only (`inputmode="numeric"`). Paste fills multiple cells. When the
 * value reaches {@link length}, {@link completed} emits so the host can submit.
 *
 * Built-in **resend** row with cooldown — host listens to {@link resend} to
 * call the API; the control only manages UI + timer.
 *
 * @example
 * ```html
 * <aies-otp-input
 *   label="Verification code"
 *   hint="Enter the 6-digit code we sent"
 *   [length]="6"
 *   [resendCooldown]="60"
 *   [(value)]="code"
 *   (completed)="verify($event)"
 *   (resend)="sendCodeAgain()"
 * />
 * ```
 */
@Component({
  selector: 'aies-otp-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'block',
  },
  template: `
    <div
      role="group"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-disabled]="disabled() ? true : null"
    >
      @if (label()) {
        <p [id]="labelId" [class]="labelClass">{{ label() }}</p>
      }
      <div
        class="flex flex-wrap gap-2"
        [class.opacity-50]="disabled()"
        [class.cursor-not-allowed]="disabled()"
      >
        @for (digit of cells(); track $index; let i = $index) {
          <input
            #cellInput
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            [class]="cellClass()"
            [id]="i === 0 ? controlId : null"
            [value]="digit"
            [disabled]="disabled()"
            [attr.autocomplete]="i === 0 ? 'one-time-code' : 'off'"
            [attr.aria-label]="'Digit ' + (i + 1) + ' of ' + length()"
            [attr.aria-invalid]="error() ? true : null"
            (input)="onCellInput(i, $event)"
            (keydown)="onCellKeydown(i, $event)"
            (paste)="onPaste(i, $event)"
            (focus)="onCellFocus(i)"
            (blur)="onBlur()"
          />
        }
      </div>
      @if (error(); as err) {
        <p [id]="errorId" [class]="errorClass" role="alert">{{ err }}</p>
      } @else if (hint(); as h) {
        <p [id]="hintId" [class]="hintClass">{{ h }}</p>
      }

      @if (showResend()) {
        <div
          class="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-neutral-600 dark:text-neutral-400"
        >
          <span>{{ resendPrompt() }}</span>
          @if (cooldownRemaining() > 0) {
            <span class="tabular-nums" aria-live="polite">
              Resend in {{ cooldownRemaining() }}s
            </span>
          } @else {
            <button
              aies-button
              type="button"
              variant="ghost"
              size="sm"
              class="!min-h-0 !px-1.5 !py-0.5 !text-body-sm"
              [disabled]="disabled()"
              (click)="onResendClick()"
            >
              {{ resendLabel() }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class OtpInputComponent implements ControlValueAccessor, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cellInputs =
    viewChildren<ElementRef<HTMLInputElement>>('cellInput');

  protected readonly controlId = `aies-otp-input-${++nextOtpId}`;
  protected readonly labelId = `${this.controlId}-label`;
  protected readonly hintId = `${this.controlId}-hint`;
  protected readonly errorId = `${this.controlId}-error`;

  protected readonly labelClass = FORM_LABEL_CLASS;
  protected readonly hintClass = FORM_HINT_CLASS;
  protected readonly errorClass = FORM_ERROR_CLASS;

  protected readonly cellClass = computed(() => {
    let classes =
      'size-10 shrink-0 rounded-md border border-neutral-300 bg-white text-center text-body font-medium text-ink outline-none transition-colors ' +
      'dark:border-white/20 dark:bg-ink-950 dark:text-white ' +
      'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-ink disabled:cursor-not-allowed';
    if (this.error()) {
      classes += ` ${FORM_FIELD_ERROR_CLASS}`;
    }
    return classes;
  });

  /** Visible group label. */
  readonly label = input('');

  /** Helper copy. Hidden while {@link error} is set. */
  readonly hint = input<string | undefined>(undefined);

  /** Field-level validation message. */
  readonly error = input<string | null>(null);

  /** Number of digit cells (default 6). */
  readonly length = input(6, { transform: numberAttribute });

  /** Concatenated digit string (`[(value)]` + CVA). */
  readonly value = model('');

  /** Host disable flag (in addition to CVA). */
  readonly disabledInput = input(false, {
    alias: 'disabled',
    transform: booleanAttribute,
  });

  /** Show the “Didn’t get a code? / Resend” row (default true). */
  readonly showResend = input(true, { transform: booleanAttribute });

  /** Copy before the resend action. */
  readonly resendPrompt = input("Didn't get a code?");

  /** Label on the resend button when cooldown is idle. */
  readonly resendLabel = input('Resend');

  /**
   * Cooldown seconds after mount and after each resend click (default 60).
   * Set to `0` to allow resend immediately with no timer.
   */
  readonly resendCooldown = input(60, { transform: numberAttribute });

  /**
   * Emits the full code when every cell is filled (typing or paste).
   * Host owns submit / verify — this control does not call APIs.
   */
  readonly completed = output<string>();

  /**
   * Emits when the user requests another code. Host should call the resend API;
   * the control restarts the cooldown automatically.
   */
  readonly resend = output<void>();

  protected readonly cvaDisabled = signal(false);
  protected readonly disabled = computed(
    () => this.disabledInput() || this.cvaDisabled(),
  );

  /** Seconds left before Resend is enabled. */
  protected readonly cooldownRemaining = signal(0);

  /** Per-cell digits derived from {@link value}, padded to {@link length}. */
  protected readonly cells = computed(() => {
    const len = Math.max(1, Math.floor(this.length()) || 6);
    const digits = this.digitsOnly(this.value()).slice(0, len);
    return Array.from({ length: len }, (_, i) => digits[i] ?? '');
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
  private lastCompleted = '';
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearCooldownTimer());
    // Assume the host already sent the first code — start cooldown on mount.
    queueMicrotask(() => this.startCooldown());
  }

  ngOnDestroy(): void {
    this.clearCooldownTimer();
  }

  /** @param value - Form model; non-digits stripped, truncated to length. */
  writeValue(value: string | null): void {
    this.applyValue(this.digitsOnly(value ?? ''), false);
  }

  /** @param fn - User change callback. */
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

  protected onResendClick(): void {
    if (this.disabled() || this.cooldownRemaining() > 0) {
      return;
    }
    this.resend.emit();
    this.startCooldown();
  }

  /**
   * Restart the cooldown from outside (e.g. after a successful resend API call
   * that the host triggered some other way). Usually unnecessary — click already
   * starts the timer.
   */
  restartCooldown(): void {
    this.startCooldown();
  }

  protected onCellInput(index: number, event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = this.digitsOnly(inputEl.value);
    const digit = raw.slice(-1);
    inputEl.value = digit;

    const next = [...this.cells()];
    next[index] = digit;
    this.commitCells(next);

    if (digit && index < next.length - 1) {
      this.focusCell(index + 1);
    }
  }

  protected onCellKeydown(index: number, event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'Backspace') {
      event.preventDefault();
      const next = [...this.cells()];
      if (next[index]) {
        next[index] = '';
        this.commitCells(next);
      } else if (index > 0) {
        next[index - 1] = '';
        this.commitCells(next);
        this.focusCell(index - 1);
      }
      return;
    }
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusCell(index - 1);
      return;
    }
    if (key === 'ArrowRight' && index < this.cells().length - 1) {
      event.preventDefault();
      this.focusCell(index + 1);
      return;
    }
    if (
      key.length === 1 &&
      !/[0-9]/.test(key) &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault();
    }
  }

  protected onPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = this.digitsOnly(event.clipboardData?.getData('text') ?? '');
    if (!pasted) {
      return;
    }
    const next = [...this.cells()];
    let cursor = index;
    for (const ch of pasted) {
      if (cursor >= next.length) {
        break;
      }
      next[cursor] = ch;
      cursor += 1;
    }
    this.commitCells(next);
    const focusAt = Math.min(cursor, next.length - 1);
    this.focusCell(focusAt);
  }

  protected onCellFocus(index: number): void {
    const el = this.cellInputs()[index]?.nativeElement;
    el?.select();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private startCooldown(): void {
    const seconds = Math.max(0, Math.floor(this.resendCooldown()) || 0);
    this.clearCooldownTimer();
    if (seconds <= 0) {
      this.cooldownRemaining.set(0);
      return;
    }
    this.cooldownRemaining.set(seconds);
    this.cooldownTimer = setInterval(() => {
      const left = this.cooldownRemaining() - 1;
      if (left <= 0) {
        this.cooldownRemaining.set(0);
        this.clearCooldownTimer();
        return;
      }
      this.cooldownRemaining.set(left);
    }, 1000);
  }

  private clearCooldownTimer(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  private commitCells(cells: string[]): void {
    this.applyValue(cells.join(''), true);
  }

  private applyValue(digits: string, emit: boolean): void {
    const len = Math.max(1, Math.floor(this.length()) || 6);
    const next = digits.slice(0, len);
    this.value.set(next);
    if (emit) {
      this.onChange(next);
    }
    if (next.length === len && next !== this.lastCompleted) {
      this.lastCompleted = next;
      this.completed.emit(next);
    }
    if (next.length < len) {
      this.lastCompleted = '';
    }
  }

  private digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
  }

  private focusCell(index: number): void {
    queueMicrotask(() => {
      const el = this.cellInputs()[index]?.nativeElement;
      el?.focus();
      el?.select();
    });
  }
}
