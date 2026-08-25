import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import type { ConfirmOptions } from './confirm-options';
import { ModalService } from './modal.service';

/**
 * One-line confirm flow built on {@link ModalService}.
 *
 * WHY a service (not only a component): callers need an Observable&lt;boolean&gt;
 * they can subscribe to in event handlers without scaffolding modal open /
 * afterClosed plumbing every time.
 *
 * @example
 * ```ts
 * const confirm = inject(ConfirmService);
 *
 * confirm
 *   .confirm({
 *     title: 'Delete shipment?',
 *     message: 'This cannot be undone.',
 *     confirmLabel: 'Delete',
 *     danger: true,
 *     onConfirm: () => this.shipments.delete(id),
 *   })
 *   .subscribe((ok) => {
 *     if (ok) {
 *       this.refreshList();
 *     }
 *   });
 * ```
 */
@Injectable()
export class ConfirmService {
  private readonly modal = inject(ModalService);

  /**
   * Opens {@link ConfirmDialogComponent} and resolves to whether the user
   * confirmed.
   *
   * Not dismissible by default. When `options.dismissible` is true, backdrop /
   * Escape map to `false` (same as Cancel) so callers only branch on an
   * affirmative click.
   *
   * When `options.onConfirm` is set, Confirm stays open with a loading primary
   * button until that work settles. Success emits `true`; errors leave the
   * dialog open (this Observable does not emit until close).
   *
   * @param options - Title, message, button labels, and optional confirm work.
   * @returns Observable that emits once with `true` / `false`, then completes.
   */
  confirm(options: ConfirmOptions): Observable<boolean> {
    return this.modal
      .open<ConfirmOptions, boolean>(ConfirmDialogComponent, {
        data: options,
        dismissible: options.dismissible === true,
      })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
