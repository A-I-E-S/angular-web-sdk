import type { OverlayHandle } from '@aies/aies-core';
import {
  Overlay,
  type OverlayConfig,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injector, type StaticProvider, type Type } from '@angular/core';

import { AiesOverlayRef } from './aies-overlay-ref';
import { OVERLAY_DATA } from './overlay-data.token';

/**
 * Shared open options for modal and drawer surfaces.
 *
 * @typeParam TData - Value injected as {@link OVERLAY_DATA}.
 */
export interface OverlayOpenConfig<TData = unknown> {
  /** Arbitrary payload for the hosted component (query-param siblings, form seed, …). */
  data?: TData;
  /** When true, backdrop click and Escape do not dismiss the overlay. */
  disableClose?: boolean;
}

/**
 * Attaches a standalone component to a CDK overlay and returns an
 * {@link OverlayHandle}.
 *
 * WHY shared helper: modal and drawer differ only in panel positioning /
 * panel classes; close semantics, data injection, and handle lifecycle stay
 * identical so route overlays behave the same on both surfaces.
 *
 * @typeParam TData - {@link OVERLAY_DATA} shape.
 * @typeParam TResult - `close(result)` / `afterClosed` payload.
 */
export function attachOverlayContent<TData = unknown, TResult = unknown>(
  overlay: Overlay,
  parentInjector: Injector,
  component: Type<unknown>,
  overlayConfig: OverlayConfig,
  config?: OverlayOpenConfig<TData>,
): OverlayHandle<TResult> {
  const overlayRef: OverlayRef = overlay.create(overlayConfig);
  const handle = new AiesOverlayRef<TResult>(overlayRef);

  const providers: StaticProvider[] = [
    { provide: AiesOverlayRef, useValue: handle },
    { provide: OVERLAY_DATA, useValue: config?.data },
  ];

  const injector = Injector.create({
    parent: parentInjector,
    providers,
  });

  const portal = new ComponentPortal(component, null, injector);
  overlayRef.attach(portal);

  if (!config?.disableClose) {
    overlayRef.backdropClick().subscribe(() => handle.close());
    overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handle.close();
      }
    });
  }

  return handle;
}
