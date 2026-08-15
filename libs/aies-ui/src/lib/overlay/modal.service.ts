import { Overlay } from '@angular/cdk/overlay';
import { inject,Injectable, Injector, type Type } from '@angular/core';

import type { OverlayHandle, OverlayOpener } from '@aies/aies-core';

import {
  attachOverlayContent,
  type OverlayOpenConfig,
} from './overlay-attach';

/**
 * Opens centered modal dialogs via Angular CDK Overlay.
 *
 * Implements {@link OverlayOpener} so {@link RouteOverlayService} can open
 * the same surface through {@link MODAL_SERVICE} without importing this
 * package. Prefer {@link provideAiesUiOverlays} at bootstrap so the token
 * binding is registered once.
 *
 * @example
 * ```ts
 * // app.config.ts
 * providers: [provideAiesUiOverlays()]
 *
 * // Open from a feature
 * @Component({ standalone: true, template: `…` })
 * class EditShipmentModal {
 *   readonly data = inject<{ id: string }>(OVERLAY_DATA);
 *   private readonly ref = inject(AiesOverlayRef<Shipment>);
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
   * `inject(AiesOverlayRef).close(result)` to dismiss with a value.
   *
   * @typeParam TData - Shape injected as {@link OVERLAY_DATA}.
   * @typeParam TResult - Value emitted by `afterClosed` when closed with a result.
   * @param component - Standalone component type to attach via ComponentPortal.
   * @param config - Optional data bag and close-behavior flags.
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
   *   readonly ref = inject(AiesOverlayRef<{ saved: boolean }>);
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
    config?: OverlayOpenConfig<TData>,
  ): OverlayHandle<TResult> {
    const extraPanelClass =
      config?.panelClass == null
        ? []
        : Array.isArray(config.panelClass)
          ? [...config.panelClass]
          : [config.panelClass];

    return attachOverlayContent<TData, TResult>(
      this.overlay,
      this.injector,
      component,
      {
        hasBackdrop: true,
        // Token-named utilities: consumers' Tailwind scan picks these up from
        // the published UI bundle content path (see aies-theme THEME.md).
        backdropClass: [
          'aies-overlay-backdrop',
          'bg-ink/45',
          'backdrop-blur-sm',
          'dark:bg-ink/60',
        ],
        panelClass: [
          'aies-modal-panel',
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
          'max-w-lg',
          'w-[min(100vw-2rem,32rem)]',
          'max-h-[min(100vh-2rem,90vh)]',
          'overflow-x-hidden',
          'overflow-y-auto',
          'will-change-transform',
          ...extraPanelClass,
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
