import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

import { copyToClipboard } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent, type ButtonSize } from '../button/button.component';
import { ToastService } from '../toast/toast.service';

/**
 * Icon button that copies {@link value} to the clipboard.
 *
 * Shows `copy` → `check` while feedback is visible. Optional toast when
 * {@link ToastService} is registered via `provideAiesToasts()`.
 *
 * @example
 * ```html
 * <aies-copy [value]="row.reference" />
 * <aies-copy [value]="snippet" label="Copy code" />
 * <aies-copy [value]="ref" ariaLabel="Copy reference" [announce]="true" />
 * ```
 */
@Component({
  selector: 'aies-copy',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, AiesIconComponent],
  template: `
    <button
      aies-button
      type="button"
      variant="ghost"
      [size]="size()"
      [disabled]="busy()"
      [class]="buttonClass()"
      [attr.aria-label]="resolvedAriaLabel()"
      [title]="resolvedAriaLabel()"
      (click)="onCopy()"
    >
      <aies-icon [name]="showCopied() ? 'check' : 'copy'" [size]="iconSize()" />
      @if (label(); as text) {
        <span>{{ showCopied() ? copiedLabel() : text }}</span>
      }
    </button>
  `,
})
export class CopyButtonComponent {
  private readonly toastService = inject(ToastService, { optional: true });

  /** Plain text written to the clipboard. */
  readonly value = input.required<string>();

  /**
   * Optional visible label beside the icon. When omitted, the control is
   * icon-only (use {@link ariaLabel} for accessibility).
   */
  readonly label = input<string | undefined>(undefined);

  /** Label while the success checkmark is showing. Defaults to `Copied`. */
  readonly copiedLabel = input('Copied');

  /**
   * Accessible name. Defaults to `Copy` / `Copied` from the label state, or
   * `Copy to clipboard` when icon-only.
   */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Extra classes on the inner `aies-button` (e.g. inverted code headers). */
  readonly buttonClass = input('');

  /** Button size. Defaults to `sm`. */
  readonly size = input<ButtonSize>('sm');

  /** How long the checkmark / “Copied” label stays (ms). Defaults to 1600. */
  readonly feedbackMs = input(1600, { transform: numberAttribute });

  /**
   * When true and {@link ToastService} is available, show a success toast with
   * the copied value (truncated when long).
   */
  readonly announce = input(false, { transform: booleanAttribute });

  /** Emitted after a successful clipboard write. */
  readonly copied = output<string>();

  /** Emitted when the clipboard write fails. */
  readonly failed = output<void>();

  protected readonly busy = signal(false);
  protected readonly showCopied = signal(false);

  private feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly iconSize = computed(() => (this.size() === 'lg' ? 18 : 14));

  protected readonly resolvedAriaLabel = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) {
      return this.showCopied() ? 'Copied' : explicit;
    }
    const label = this.label();
    if (label) {
      return this.showCopied() ? this.copiedLabel() : label;
    }
    return this.showCopied() ? 'Copied' : 'Copy to clipboard';
  });

  /**
   * Copy {@link value} and flip the icon to a checkmark on success.
   */
  protected async onCopy(): Promise<void> {
    if (this.busy()) {
      return;
    }
    const text = this.value();
    this.busy.set(true);
    try {
      const ok = await copyToClipboard(text);
      if (!ok) {
        this.failed.emit();
        this.toastService?.error('Could not copy to the clipboard.');
        return;
      }
      this.flashCopied();
      this.copied.emit(text);
      if (this.announce() && this.toastService) {
        const preview =
          text.length > 64 ? `${text.slice(0, 61).trimEnd()}…` : text;
        this.toastService.success(`Copied ${preview}`);
      }
    } finally {
      this.busy.set(false);
    }
  }

  private flashCopied(): void {
    this.showCopied.set(true);
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
    }
    this.feedbackTimer = setTimeout(() => {
      this.showCopied.set(false);
      this.feedbackTimer = null;
    }, this.feedbackMs());
  }
}
