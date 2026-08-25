import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';

/**
 * Compact error pill for non-blocking failures while stale data stays visible —
 * distinct from {@link ErrorStateComponent} (full-section blocking).
 *
 * Parent owns placement — typically a flex row above the content
 * (`class="flex justify-end"` with `max-w-[min(100%,20rem)]` on the indicator).
 * Renders nothing when {@link error} is null, undefined, or whitespace-only.
 *
 * @example
 * ```html
 * <div class="flex flex-col gap-3">
 *   <div class="flex justify-end">
 *     <africanies-error-indicator
 *       class="max-w-[min(100%,20rem)]"
 *       error="Failed to fetch the most recent data."
 *       retryText="Refresh"
 *       [refreshing]="isRefreshing()"
 *       (retry)="refetch()"
 *     />
 *   </div>
 *   <africanies-table [rows]="rows()" />
 * </div>
 * ```
 */
@Component({
  selector: 'africanies-error-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  host: {
    class: 'africanies-error-indicator block',
  },
  styles: [
    `
      @keyframes africanies-error-indicator-enter {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes africanies-error-indicator-dot-pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 0.7;
        }
        50% {
          transform: scale(1.3);
          opacity: 1;
        }
      }

      @keyframes africanies-error-indicator-dot-ping {
        0% {
          transform: scale(1);
          opacity: 0.75;
        }
        70%,
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }

      .africanies-error-indicator-pill {
        animation: africanies-error-indicator-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .africanies-error-indicator-dot-ping {
        animation: africanies-error-indicator-dot-ping 1.5s cubic-bezier(0, 0, 0.2, 1)
          infinite;
      }

      .africanies-error-indicator-dot-core {
        animation: africanies-error-indicator-dot-pulse 1.5s ease-in-out infinite
          alternate;
      }

      .africanies-error-indicator-retry:not(:disabled) {
        transition: transform 0.15s ease;
      }

      .africanies-error-indicator-retry:not(:disabled):hover {
        transform: scale(1.05);
      }

      .africanies-error-indicator-retry:not(:disabled):active {
        transform: scale(0.95);
      }

      @media (prefers-reduced-motion: reduce) {
        .africanies-error-indicator-pill,
        .africanies-error-indicator-dot-ping,
        .africanies-error-indicator-dot-core,
        .africanies-error-indicator-retry:not(:disabled) {
          animation: none;
          transition: none;
        }

        .africanies-error-indicator-retry:not(:disabled):hover,
        .africanies-error-indicator-retry:not(:disabled):active {
          transform: none;
        }
      }
    `,
  ],
  template: `
    @if (visible()) {
      <div
        class="africanies-error-indicator-pill inline-flex max-w-full items-center gap-2 rounded-full bg-danger-subtle px-3 py-1 shadow-sm dark:bg-red-900/20"
        role="alert"
        aria-live="assertive"
      >
        <span
          class="relative inline-flex size-3 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <span
            class="africanies-error-indicator-dot-ping absolute inset-0 rounded-full bg-red-400 opacity-75"
          ></span>
          <span
            class="africanies-error-indicator-dot-core relative size-3 rounded-full bg-red-500"
          ></span>
        </span>

        <span
          class="min-w-0 flex-1 text-caption font-medium leading-snug text-ink dark:text-white"
        >
          {{ message() }}
        </span>

        <button
          africanies-button
          type="button"
          variant="ghost"
          size="sm"
          class="africanies-error-indicator-retry shrink-0 !min-h-0 !border-transparent !bg-transparent !px-1.5 !py-0.5 !text-danger hover:!bg-danger/10 dark:hover:!bg-danger/20"
          [class.opacity-50]="disabled()"
          [disabled]="disabled()"
          (click)="onRetry()"
        >
          {{ actionLabel() }}
        </button>
      </div>
    }
  `,
})
export class ErrorIndicatorComponent {
  /**
   * Error copy. When empty, the indicator is not shown.
   */
  readonly error = input<string | null | undefined>(undefined);

  /**
   * Retry button label when not {@link refreshing}.
   */
  readonly retryText = input('Retry');

  /**
   * When true, the action label becomes a loading phrase and the button stays
   * enabled unless {@link disabled} is set.
   */
  readonly refreshing = input(false, { transform: booleanAttribute });

  /**
   * Loading label while {@link refreshing} is true.
   */
  readonly refreshingText = input('Loading...');

  /**
   * Disables the retry control and dims the label.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emitted when the user activates the retry control. */
  readonly retry = output<void>();

  protected readonly message = computed(() => {
    const text = this.error()?.trim();
    return text ? text : null;
  });

  protected readonly visible = computed(() => this.message() !== null);

  protected readonly actionLabel = computed(() =>
    this.refreshing() ? this.refreshingText() : this.retryText(),
  );

  protected onRetry(): void {
    if (this.disabled()) {
      return;
    }
    this.retry.emit();
  }
}
