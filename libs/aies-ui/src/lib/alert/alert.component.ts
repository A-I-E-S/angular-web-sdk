import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import type { IconName } from '@aies/aies-icons';
import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent } from '../button/button.component';

/**
 * Visual tone for {@link AlertComponent}.
 *
 * - `info` — neutral guidance
 * - `success` — positive confirmation (export-green subtle)
 * - `warning` — caution that needs attention
 * - `danger` — blocking / destructive messaging
 */
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const DEFAULT_ICONS: Record<AlertVariant, IconName> = {
  info: 'info-circle',
  success: 'check-circle',
  warning: 'warning',
  danger: 'warning',
};

/**
 * Inline page/section banner — distinct from {@link ErrorStateComponent}
 * (full-section async failure + Retry).
 *
 * Parent owns visibility (`@if` / signal). When the user dismisses, emit
 * {@link dismissed} and unmount the host — this component does not hide itself.
 *
 * @example
 * ```html
 * @if (showBanner()) {
 *   <aies-alert
 *     variant="warning"
 *     title="Rates outdated"
 *     message="Refresh to pull the latest carrier rates."
 *     (dismissed)="showBanner.set(false)"
 *   />
 * }
 * ```
 */
@Component({
  selector: 'aies-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, ButtonComponent],
  template: `
    <div
      [class]="shellClass()"
      [attr.role]="a11yRole()"
      [attr.aria-live]="a11yLive()"
    >
      <aies-icon
        [name]="resolvedIcon()"
        [size]="20"
        [class]="iconClass()"
        class="shrink-0"
      />

      <div class="min-w-0 flex-1 flex flex-col justify-center gap-1">
        @if (title(); as heading) {
          <p [class]="titleClass()">{{ heading }}</p>
        }
        <p [class]="messageClass()">{{ message() }}</p>
        <ng-content />
      </div>

      @if (dismissible()) {
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          class="shrink-0 !min-h-0 !px-1.5 !py-1"
          aria-label="Dismiss"
          (click)="onDismiss()"
        >
          <aies-icon name="close" [size]="16" />
        </button>
      }
    </div>
  `,
})
export class AlertComponent {
  /** Semantic tone. Defaults to `info`. */
  readonly variant = input<AlertVariant>('info');

  /** Optional short heading above the message. */
  readonly title = input<string | undefined>(undefined);

  /** Body copy — required so the banner is never an empty colored box. */
  readonly message = input.required<string>();

  /**
   * When true (default), shows a dismiss control that emits {@link dismissed}.
   */
  readonly dismissible = input(true, { transform: booleanAttribute });

  /** Override the default variant icon. */
  readonly icon = input<IconName | undefined>(undefined);

  /** Emitted when the user activates Dismiss — parent should unmount/hide. */
  readonly dismissed = output<void>();

  protected readonly resolvedIcon = computed(
    () => this.icon() ?? DEFAULT_ICONS[this.variant()],
  );

  protected readonly a11yRole = computed(() => {
    const v = this.variant();
    return v === 'warning' || v === 'danger' ? 'alert' : 'status';
  });

  protected readonly a11yLive = computed(() => {
    const v = this.variant();
    return v === 'warning' || v === 'danger' ? 'assertive' : 'polite';
  });

  protected readonly shellClass = computed(() => {
    const base =
      'flex items-center gap-3 rounded-lg border px-4 py-3 text-body ' +
      'text-ink dark:text-white';
    switch (this.variant()) {
      case 'success':
        return `${base} border-export/30 bg-export-subtle dark:border-export/40 dark:bg-export/15`;
      case 'warning':
        return `${base} border-warning/40 bg-warning-subtle dark:border-warning/50 dark:bg-warning/15`;
      case 'danger':
        return `${base} border-danger/30 bg-danger-subtle dark:border-danger/40 dark:bg-danger/15`;
      default:
        return `${base} border-border bg-background-welcome dark:border-white/15 dark:bg-ink-950`;
    }
  });

  protected readonly iconClass = computed(() => {
    switch (this.variant()) {
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
    const base = 'm-0 text-body font-medium';
    switch (this.variant()) {
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

  protected readonly messageClass = computed(
    () => 'm-0 text-body-sm text-neutral-600 dark:text-neutral-300',
  );

  protected onDismiss(): void {
    this.dismissed.emit();
  }
}
