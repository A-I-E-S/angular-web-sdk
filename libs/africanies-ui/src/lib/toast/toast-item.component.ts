import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { ButtonComponent } from '../button/button.component';
import {
  TOAST_ICONS,
  type ToastItem,
  type ToastVariant,
} from './toast.types';

/**
 * Single toast card — dense, token-based, with optional countdown rail.
 * Stacked identical toasts can expand; close peels the outermost copy.
 */
@Component({
  selector: 'africanies-toast-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent],
  host: {
    class: 'pointer-events-auto block w-full',
    '[class.is-paused]': 'isPaused()',
    '(mouseenter)': 'onPause()',
    '(mouseleave)': 'onResume()',
    '(focusin)': 'onPause()',
    '(focusout)': 'onResume()',
  },
  template: `
    <div class="flex w-full flex-col gap-1.5">
      @if (item().expanded && item().count > 1) {
        @for (copy of copies(); track copy; let i = $index) {
          <div
            [class]="shellClass()"
            [attr.role]="i === 0 ? a11yRole() : null"
            [attr.aria-live]="i === 0 ? a11yLive() : null"
          >
            <div [class]="accentClass()" aria-hidden="true"></div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start gap-3 px-3.5 py-3">
                <africanies-icon
                  [name]="item().icon ?? defaultIcon()"
                  [size]="18"
                  [class]="iconClass()"
                  class="mt-0.5 shrink-0"
                />
                <div class="min-w-0 flex-1">
                  @if (item().title; as heading) {
                    <p [class]="titleClass()">{{ heading }}</p>
                  }
                  <p
                    class="m-0 break-words text-body-sm text-neutral-600 dark:text-neutral-300"
                  >
                    {{ item().message }}
                  </p>
                </div>
                <button
                  africanies-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="!min-h-0 !px-1.5 !py-1 shrink-0"
                  aria-label="Dismiss"
                  (click)="dismissOne.emit()"
                >
                  <africanies-icon name="close" [size]="14" />
                </button>
              </div>
            </div>
          </div>
        }
        <div class="flex flex-wrap justify-end gap-1 px-0.5">
          <button
            africanies-button
            type="button"
            variant="ghost"
            size="sm"
            class="!min-h-0 !px-2 !py-1 !text-caption"
            (click)="collapse.emit()"
          >
            Collapse
          </button>
          <button
            africanies-button
            type="button"
            variant="ghost"
            size="sm"
            class="!min-h-0 !px-2 !py-1 !text-caption"
            (click)="dismissAll.emit()"
          >
            Close all
          </button>
        </div>
      } @else {
        <div
          [class]="shellClass()"
          [attr.role]="a11yRole()"
          [attr.aria-live]="a11yLive()"
        >
          <div [class]="accentClass()" aria-hidden="true"></div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-3 px-3.5 pt-3 pb-3">
              <africanies-icon
                [name]="item().icon ?? defaultIcon()"
                [size]="18"
                [class]="iconClass()"
                class="mt-0.5 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-2">
                  <div class="min-w-0 flex-1">
                    @if (item().title; as heading) {
                      <p [class]="titleClass()">{{ heading }}</p>
                    }
                    <p
                      class="m-0 break-words text-body-sm text-neutral-600 dark:text-neutral-300"
                    >
                      {{ item().message }}
                    </p>
                  </div>
                  @if (item().count > 1) {
                    <span
                      class="shrink-0 rounded-full bg-ink/8 px-1.5 py-0.5 text-caption font-semibold tabular-nums text-ink dark:bg-white/15 dark:text-white"
                    >
                      ×{{ item().count }}
                    </span>
                  }
                  <button
                    africanies-button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="!min-h-0 !px-1.5 !py-1 shrink-0"
                    [attr.aria-label]="
                      item().count > 1 ? 'Dismiss outermost' : 'Dismiss'
                    "
                    (click)="dismissOne.emit()"
                  >
                    <africanies-icon name="close" [size]="14" />
                  </button>
                </div>
                @if (item().count > 1) {
                  <div class="mt-2 flex flex-wrap gap-1">
                    <button
                      africanies-button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="!min-h-0 !px-2 !py-1 !text-caption"
                      (click)="expand.emit()"
                    >
                      Expand
                    </button>
                    <button
                      africanies-button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="!min-h-0 !px-2 !py-1 !text-caption"
                      (click)="dismissAll.emit()"
                    >
                      Close all
                    </button>
                  </div>
                }
              </div>
            </div>
            @if (item().durationMs) {
              <div
                class="h-0.5 w-full overflow-hidden bg-ink/5 dark:bg-white/10"
                aria-hidden="true"
              >
                <div
                  class="africanies-toast-rail h-full w-full origin-left"
                  [class]="railFillClass()"
                  [style.animation-duration.ms]="item().durationMs"
                ></div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    @keyframes africanies-toast-in {
      from {
        opacity: 0;
        transform: translateX(0.75rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    @keyframes africanies-toast-rail {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
    .africanies-toast-enter {
      animation: africanies-toast-in 220ms ease-out both;
    }
    .africanies-toast-rail {
      animation-name: africanies-toast-rail;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
    }
    :host.is-paused .africanies-toast-rail {
      animation-play-state: paused;
    }
  `,
})
export class ToastItemComponent {
  /** Stack entry to render. */
  readonly item = input.required<ToastItem>();

  /** Peel one copy (outermost) from the stack. */
  readonly dismissOne = output<void>();
  /** Remove the whole stack. */
  readonly dismissAll = output<void>();
  /** Show every stacked copy. */
  readonly expand = output<void>();
  /** Fold expanded copies back into one card. */
  readonly collapse = output<void>();
  /** Hover / focus — pause timer. */
  readonly paused = output<void>();
  /** Leave — resume timer. */
  readonly resumed = output<void>();

  protected readonly isPaused = signal(false);

  protected readonly copies = computed(() =>
    Array.from({ length: Math.max(1, this.item().count) }, (_, i) => i),
  );

  protected readonly defaultIcon = computed(
    () => TOAST_ICONS[this.item().variant],
  );

  protected readonly a11yRole = computed(() => {
    const v = this.item().variant;
    return v === 'warning' || v === 'danger' ? 'alert' : 'status';
  });

  protected readonly a11yLive = computed(() => {
    const v = this.item().variant;
    return v === 'warning' || v === 'danger' ? 'assertive' : 'polite';
  });

  protected readonly shellClass = computed(
    () =>
      'africanies-toast-enter relative flex w-full overflow-hidden rounded-lg border border-border ' +
      'bg-white/95 text-ink shadow-lg backdrop-blur-md ' +
      'dark:border-white/15 dark:bg-ink-950/95 dark:text-white',
  );

  protected readonly accentClass = computed(
    () => `w-1 shrink-0 self-stretch ${accentFill(this.item().variant)}`,
  );

  protected readonly iconClass = computed(() => {
    switch (this.item().variant) {
      case 'success':
        return 'text-export dark:text-export-light';
      case 'warning':
        return 'text-warning-dark dark:text-warning';
      case 'danger':
        return 'text-danger';
      default:
        return 'text-ink-blue dark:text-neutral-300';
    }
  });

  protected readonly titleClass = computed(() => {
    const base = 'm-0 break-words text-body-sm font-semibold';
    switch (this.item().variant) {
      case 'success':
        return `${base} text-export dark:text-export-light`;
      case 'warning':
        return `${base} text-warning-dark dark:text-warning`;
      case 'danger':
        return `${base} text-danger`;
      default:
        return `${base} text-ink dark:text-white`;
    }
  });

  protected readonly railFillClass = computed(() =>
    railFill(this.item().variant),
  );

  protected onPause(): void {
    this.isPaused.set(true);
    this.paused.emit();
  }

  protected onResume(): void {
    this.isPaused.set(false);
    this.resumed.emit();
  }
}

/**
 * @param variant - Toast tone.
 * @returns Accent bar fill.
 */
function accentFill(variant: ToastVariant): string {
  switch (variant) {
    case 'success':
      return 'bg-export';
    case 'warning':
      return 'bg-warning';
    case 'danger':
      return 'bg-danger';
    default:
      return 'bg-neutral-400';
  }
}

/**
 * @param variant - Toast tone.
 * @returns Progress rail fill class.
 */
function railFill(variant: ToastVariant): string {
  return accentFill(variant);
}
