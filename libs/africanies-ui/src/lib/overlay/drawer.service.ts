import { Overlay } from '@angular/cdk/overlay';
import { inject,Injectable, Injector, type Type } from '@angular/core';

import type { OverlayHandle, OverlayOpener } from '@africanies/africanies-core';

import {
  attachOverlayContent,
  type OverlayOpenConfig,
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
   * Not dismissible by default — set `dismissible: true` for backdrop / Escape
   * close. Inject {@link OVERLAY_DATA} and {@link AfricaniesOverlayRef} inside the
   * hosted component the same way as modals.
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
        backdropClass: [
          'africanies-overlay-backdrop',
          'bg-ink/45',
          'backdrop-blur-sm',
          'dark:bg-ink-950/60',
        ],
        panelClass: [
          'africanies-drawer-panel',
          'bg-white',
          'dark:bg-ink-950',
          'text-ink',
          'dark:text-white',
          'shadow-xl',
          'border-l',
          'border-border',
          'dark:border-white/15',
          'flex',
          'flex-col',
          'items-stretch',
          'h-full',
          'min-h-0',
          'w-[min(100%,24rem)]',
          'p-6',
          'will-change-transform',
          ...extraPanelClass,
          '!overflow-hidden',
        ],
        scrollStrategy: this.overlay.scrollStrategies.block(),
        positionStrategy: this.overlay
          .position()
          .global()
          .right('0')
          .top('0')
          .bottom('0'),
      },
      'drawer',
      config,
    );
  }
}
