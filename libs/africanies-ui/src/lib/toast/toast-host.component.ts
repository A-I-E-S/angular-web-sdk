import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { AfricaniesUiI18n } from '../i18n/africanies-ui-i18n';
import { ToastService } from './toast.service';
import type { ToastItem } from './toast.types';
import { ToastItemComponent } from './toast-item.component';

/**
 * Fixed stack host attached once by {@link ToastService.ensureHost}.
 * Caps to the viewport and scrolls when the stack (or an expanded group)
 * would otherwise run off-screen.
 */
@Component({
  selector: 'africanies-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastItemComponent, ButtonComponent],
  host: {
    class:
      'africanies-overlay-scroll pointer-events-auto block min-h-0 w-[min(calc(100%-2rem),24rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain',
    role: 'region',
    '[attr.aria-label]': 'notificationsAria()',
  },
  template: `
    <div class="flex w-full flex-col gap-2">
      @if (toastService.showHostActions()) {
        <div
          class="sticky top-0 z-10 flex flex-wrap justify-end gap-2 bg-transparent pb-1 dark:bg-transparent"
        >
          @if (toastService.hasStacks()) {
            @if (toastService.allStacksExpanded()) {
              <button
                africanies-button
                type="button"
                variant="flat"
                size="sm"
                class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
                (click)="toastService.collapseAll()"
              >
                {{ collapseAllLabel() }}
              </button>
            } @else {
              <button
                africanies-button
                type="button"
                variant="flat"
                size="sm"
                class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
                (click)="toastService.expandAll()"
              >
                {{ expandAllLabel() }}
              </button>
            }
          }
          <button
            africanies-button
            type="button"
            variant="flat"
            size="sm"
            class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
            (click)="toastService.clear()"
          >
            {{ closeAllLabel() }}
          </button>
        </div>
      }
      @for (toast of toasts(); track trackToast(toast)) {
        <africanies-toast-item
          [item]="toast"
          (dismissOne)="toastService.dismissOne(toast.id)"
          (paused)="toastService.pause(toast.id)"
          (resumed)="toastService.resume(toast.id)"
        />
      }
    </div>
  `,
})
/**
 * Fixed stack host attached once by {@link ToastService.ensureHost}. Caps to the viewport and scrolls when the stack (or an expanded group) would otherwise run off-screen.
 */
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
  private readonly i18n = inject(AfricaniesUiI18n);
  protected readonly toasts = this.toastService.items;

  protected readonly notificationsAria = computed(() =>
    this.i18n.t('africaniesUi.toast.notifications', 'Notifications'),
  );
  protected readonly expandAllLabel = computed(() =>
    this.i18n.t('africaniesUi.toast.expandAll', 'Expand all'),
  );
  protected readonly collapseAllLabel = computed(() =>
    this.i18n.t('africaniesUi.toast.collapseAll', 'Collapse all'),
  );
  protected readonly closeAllLabel = computed(() =>
    this.i18n.t('africaniesUi.toast.closeAll', 'Close all'),
  );

  /**
   * Include createdAt / count / expanded so views remount when the stack changes.
   *
   * @param toast - Stack entry.
   * @returns Track key.
   */
  protected trackToast(toast: ToastItem): string {
    return `${toast.id}:${toast.createdAt}:${toast.count}:${toast.expanded}`;
  }
}
