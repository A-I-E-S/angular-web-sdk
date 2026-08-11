import type { OverlayHandle, OverlayOpener } from '@aies/aies-core';
import { Overlay } from '@angular/cdk/overlay';
import { Injectable, Injector, type Type, inject } from '@angular/core';

import {
  type OverlayOpenConfig,
  attachOverlayContent,
} from './overlay-attach';

/**
 * Opens edge-anchored drawer panels via Angular CDK Overlay.
 *
 * Same {@link OverlayOpener} contract as {@link ModalService} so route-driven
 * overlays can target either surface through {@link DRAWER_SERVICE}.
 *
 * @example
 * ```ts
 * const drawer = inject(DrawerService);
 * drawer.open(FiltersPanel, { data: { facet: 'status' } });
 * ```
 */
@Injectable()
export class DrawerService implements OverlayOpener {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  /**
   * Opens `component` in a right-side drawer panel with a dimmed backdrop.
   *
   * Backdrop click and Escape dismiss unless `disableClose` is set. Inject
   * {@link OVERLAY_DATA} and {@link AiesOverlayRef} inside the hosted
   * component the same way as modals.
   *
   * @typeParam TData - Shape injected as {@link OVERLAY_DATA}.
   * @typeParam TResult - Value emitted by `afterClosed` when closed with a result.
   * @param component - Standalone component type to attach via ComponentPortal.
   * @param config - Optional data bag and close-behavior flags.
   * @returns Handle used to close the drawer and observe dismissal.
   */
  open<TData = unknown, TResult = unknown>(
    component: Type<unknown>,
    config?: OverlayOpenConfig<TData>,
  ): OverlayHandle<TResult> {
    return attachOverlayContent<TData, TResult>(
      this.overlay,
      this.injector,
      component,
      {
        hasBackdrop: true,
        backdropClass: 'bg-ink/40',
        panelClass: [
          'aies-drawer-panel',
          'bg-white',
          'dark:bg-ink-950',
          'text-ink',
          'dark:text-white',
          'shadow-lg',
          'border-l',
          'border-border',
          'dark:border-white/15',
          'h-full',
          'w-[min(100vw,24rem)]',
          'overflow-auto',
          'p-6',
        ],
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy: this.overlay
          .position()
          .global()
          .right('0')
          .top('0')
          .bottom('0'),
      },
      config,
    );
  }
}
