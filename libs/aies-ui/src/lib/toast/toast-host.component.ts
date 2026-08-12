import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ButtonComponent } from '../button/button.component';
import { ToastService } from './toast.service';
import type { ToastItem } from './toast.types';
import { ToastItemComponent } from './toast-item.component';

/**
 * Fixed stack host attached once by {@link ToastService.ensureHost}.
 */
@Component({
  selector: 'aies-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToastItemComponent, ButtonComponent],
  host: {
    class: 'block w-[min(100vw-2rem,24rem)]',
  },
  template: `
    <div class="flex w-full flex-col gap-2" aria-label="Notifications">
      @if (toastService.hasStacks()) {
        <div class="pointer-events-auto flex flex-wrap justify-end gap-2">
          @if (toastService.allStacksExpanded()) {
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
              (click)="toastService.collapseAll()"
            >
              Collapse all
            </button>
          } @else {
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
              (click)="toastService.expandAll()"
            >
              Expand all
            </button>
          }
          <button
            aies-button
            type="button"
            variant="secondary"
            size="sm"
            class="!min-h-0 !rounded-full !bg-white !px-2.5 !py-1 !text-caption dark:!bg-ink"
            (click)="toastService.clear()"
          >
            Close all
          </button>
        </div>
      }
      @for (toast of toasts(); track trackToast(toast)) {
        <aies-toast-item
          [item]="toast"
          (dismissOne)="toastService.dismissOne(toast.id)"
          (dismissAll)="toastService.dismiss(toast.id)"
          (expand)="toastService.expand(toast.id)"
          (collapse)="toastService.collapse(toast.id)"
          (paused)="toastService.pause(toast.id)"
          (resumed)="toastService.resume(toast.id)"
        />
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.items;

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
