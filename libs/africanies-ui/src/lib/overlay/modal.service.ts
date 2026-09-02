import { Overlay } from '@angular/cdk/overlay';
import { inject, Injectable, Injector, type Type } from '@angular/core';

import type { OverlayHandle, OverlayOpener } from '@africanies/africanies-core';

import { MODAL_SIZE_PANEL_CLASS, type ModalSize } from './modal-size';
import {
  attachOverlayContent,
  type OverlayOpenConfig,
} from './overlay-attach';

/**
 * Open options for {@link ModalService} (shared overlay flags + width size).
 *
 * @typeParam TData - Value injected as {@link OVERLAY_DATA}.
 */
export interface ModalOpenConfig<TData = unknown>
  extends OverlayOpenConfig<TData> {
  /**
   * Panel width. Defaults to `md`.
   * Use `lg` for dense forms; `xl` for media previews.
   */
  size?: ModalSize;
}

/**
 * Opens centered modal dialogs via Angular CDK Overlay.
 *
 * Implements {@link OverlayOpener} so {@link RouteOverlayService} can open
 * the same surface through {@link MODAL_SERVICE} without importing this
 * package. Prefer {@link provideAfricaniesUiOverlays} at bootstrap so the token
 * binding is registered once.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [provideAfricaniesUiOverlays()]
 *
 * // Open from a feature
 * @Component({ standalone: true, template: `…` })
 * class EditShipmentModal {
 *   readonly data = inject<{ id: string }>(OVERLAY_DATA);
 *   private readonly ref = inject(AfricaniesOverlayRef<Shipment>);
 *
 *   save(updated: Shipment): void {
 *     // WHY close with a result: callers awaiting afterClosed() can apply
 *     // the saved entity without a second fetch.
 *     this.ref.close(updated);
 *   }
 *
 *   dismiss(): void {
 *     this.ref.close();
 *   }
 * }
 *
 * const modal = inject(ModalService);
 * const handle = modal.open< { id: string }, Shipment >(EditShipmentModal, {
 *   data: { id: shipmentId },
 * });
 *
 * // Wider form modal:
 * modal.open(CouponFormModal, { data, size: 'lg' });
 *
 * // Opt into backdrop / Escape dismiss:
 * modal.open(QuickLookModal, { dismissible: true });
 *
 * handle.afterClosed().subscribe((result) => {
 *   if (result) {
 *     // apply saved shipment
 *   }
 * });
 * ```
 */
@Injectable()
export class ModalService implements OverlayOpener {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Opens `component` in a centered modal with a dimmed backdrop.
   *
   * Not dismissible by default — backdrop click and Escape do nothing unless
   * `config.dismissible` is `true`. `config.data` is available inside the
   * hosted component via {@link OVERLAY_DATA}; call
   * `inject(AfricaniesOverlayRef).close(result)` to dismiss with a value.
   *
 * Panel height is capped at `90vh`. The pane itself does not scroll — the
 * hosted component does, with a reserved scrollbar gutter so overlay
 * scrollbars cannot cover a top-right close control. Width comes from
 * {@link ModalOpenConfig.size} (`md` default). Prefer `100%` (overlay
 * wrapper) over `100vw` so the panel never sits under the viewport
 * scrollbar.
   *
   * @typeParam TData - Shape injected as {@link OVERLAY_DATA}.
   * @typeParam TResult - Value emitted by `afterClosed` when closed with a result.
   * @param component - Standalone component type to attach via ComponentPortal.
   * @param config - Optional data bag, size, and close-behavior flags.
   * @returns Handle used to close the modal and observe dismissal.
   *
   * @example
   * ```ts
   * // 1) Hosted component reads data and closes with a result
   * @Component({
   *   standalone: true,
   *   template: `
   *     <h2>Edit {{ data.id }}</h2>
   *     <button type="button" (click)="ref.close({ saved: true })">Save</button>
   *   `,
   * })
   * class EditModal {
   *   readonly data = inject<{ id: string }>(OVERLAY_DATA);
   *   readonly ref = inject(AfricaniesOverlayRef<{ saved: boolean }>);
   * }
   *
   * // 2) Caller opens and awaits the result
   * const handle = inject(ModalService).open<{ id: string }, { saved: boolean }>(
   *   EditModal,
   *   { data: { id: 'SHP-1' } },
   * );
   * handle.afterClosed().subscribe((result) => {
   *   console.log(result?.saved); // true when Save was clicked; undefined on Cancel
   * });
   * ```
   */
  open<TData = unknown, TResult = unknown>(
    component: Type<unknown>,
    config?: ModalOpenConfig<TData>,
  ): OverlayHandle<TResult> {
    const extraPanelClass =
      config?.panelClass == null
        ? []
        : Array.isArray(config.panelClass)
          ? [...config.panelClass]
          : [config.panelClass];
    const size = config?.size ?? 'md';
    const sizeClasses = MODAL_SIZE_PANEL_CLASS[size];

    return attachOverlayContent<TData, TResult>(
      this.overlay,
      this.injector,
      component,
      {
        hasBackdrop: true,
        // Token-named utilities: consumers' Tailwind scan picks these up from
        // the published UI bundle content path (see africanies-theme THEME.md).
        backdropClass: [
          'africanies-overlay-backdrop',
          'bg-ink/45',
          'backdrop-blur-sm',
          'dark:bg-ink-950/60',
        ],
        panelClass: [
          'africanies-modal-panel',
          'bg-white',
          'dark:bg-ink-950',
          'text-ink',
          'dark:text-white',
          'rounded-lg',
          'shadow-xl',
          'border',
          'border-border',
          'dark:border-white/15',
          'p-6',
          'box-border',
          // CDK pane is `display: flex` (row). Column + stretch makes hosted
          // content fill the panel so left/right padding stays even.
          'flex',
          'flex-col',
          'items-stretch',
          ...sizeClasses,
          'min-h-0',
          'will-change-transform',
          ...extraPanelClass,
          '!overflow-hidden',
          // Always cap viewport usage — after extras so hosts cannot stretch full height.
          '!max-h-[90vh]',
        ],
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
      },
      'modal',
      config,
    );
  }
}
