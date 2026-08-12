import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';

import { ButtonComponent } from '../button/button.component';
import { AiesOverlayRef } from '../overlay/aies-overlay-ref';
import { OVERLAY_DATA } from '../overlay/overlay-data.token';
import type {
  AiesNotification,
  NotificationDrawerData,
  NotificationDrawerResult,
} from './notification.types';

/**
 * Right-edge drawer listing in-app notifications.
 *
 * Opened via {@link NotificationDrawerService}.
 */
@Component({
  selector: 'aies-notification-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full',
  },
  imports: [AiesIconComponent, ButtonComponent],
  template: `
    <div class="flex h-full min-h-0 flex-col -mx-6">
      <div class="flex shrink-0 items-start justify-between gap-3 px-6 pb-4 pt-6">
        <div class="min-w-0 flex flex-col gap-1">
          <p
            class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400"
          >
            Inbox
          </p>
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">
            {{ title() }}
          </h2>
        </div>
        <button
          aies-button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Close notifications"
          (click)="ref.close()"
        >
          <aies-icon name="close" [size]="18" />
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
        @if (notifications().length === 0) {
          <div
            class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center"
          >
            <aies-icon
              name="bell-o"
              [size]="28"
              class="text-neutral-400 dark:text-neutral-500"
            />
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              You're all caught up.
            </p>
          </div>
        } @else {
          <ul class="m-0 flex list-none flex-col gap-2 p-0">
            @for (item of notifications(); track item.id) {
              <li>
                <button
                  type="button"
                  class="flex w-full flex-col gap-1 rounded-lg border border-border px-3 py-3 text-left transition-colors hover:bg-background-welcome dark:border-white/10 dark:hover:bg-white/5"
                  [class.opacity-70]="item.read"
                  (click)="select(item)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <span
                      class="text-body-sm font-medium text-ink dark:text-white"
                      >{{ item.title }}</span
                    >
                    @if (item.timestamp) {
                      <span
                        class="shrink-0 text-caption text-neutral-500 dark:text-neutral-400"
                        >{{ formatTimestamp(item.timestamp) }}</span
                      >
                    }
                  </div>
                  @if (item.body) {
                    <span
                      class="text-body-sm text-neutral-600 dark:text-neutral-400"
                      >{{ item.body }}</span
                    >
                  }
                </button>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
})
export class NotificationDrawerPanel {
  protected readonly ref =
    inject<AiesOverlayRef<NotificationDrawerResult>>(AiesOverlayRef);
  private readonly data = inject<NotificationDrawerData>(OVERLAY_DATA);

  protected readonly title = computed(() => this.data.title ?? 'Notifications');
  protected readonly notifications = computed(
    () => this.data.notifications ?? [],
  );

  protected select(item: AiesNotification): void {
    this.ref.close({ selectedId: item.id });
  }

  protected formatTimestamp(value: string): string {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    return new DatePipe('en-US').transform(parsed, 'short') ?? value;
  }
}
