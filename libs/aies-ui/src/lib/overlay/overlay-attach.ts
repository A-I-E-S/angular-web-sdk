import {
  Overlay,
  type OverlayConfig,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injector, type StaticProvider, type Type } from '@angular/core';

import type { OverlayHandle } from '@aies/aies-core';

import { AiesOverlayRef } from './aies-overlay-ref';
import { OVERLAY_DATA } from './overlay-data.token';
import {
  type OverlaySurface,
  playOverlayEnter,
  playOverlayLeave,
} from './overlay-motion';

/**
 * Shared open options for modal and drawer surfaces.
 *
 * @typeParam TData - Value injected as {@link OVERLAY_DATA}.
 */
export interface OverlayOpenConfig<TData = unknown> {
  /** Arbitrary payload for the hosted component (query-param siblings, form seed, …). */
  data?: TData;
  /**
   * When true, backdrop click and Escape dismiss the overlay.
   * Defaults to `false` — dialogs require an explicit close action.
   */
  dismissible?: boolean;
}

/**
 * Attaches a standalone component to a CDK overlay and returns an
 * {@link OverlayHandle}.
 *
 * WHY shared helper: modal and drawer differ only in panel positioning /
 * panel classes; close semantics, data injection, and handle lifecycle stay
 * identical so route overlays behave the same on both surfaces.
 *
 * @param overlay
 * @param parentInjector
 * @param component
 * @param overlayConfig
 * @param surface
 * @param config
 * @typeParam TData - {@link OVERLAY_DATA} shape.
 * @typeParam TResult - `close(result)` / `afterClosed` payload.
 * @returns Handle used to close the overlay and observe the result.
 */
export function attachOverlayContent<TData = unknown, TResult = unknown>(
  overlay: Overlay,
  parentInjector: Injector,
  component: Type<unknown>,
  overlayConfig: OverlayConfig,
  surface: OverlaySurface,
  config?: OverlayOpenConfig<TData>,
): OverlayHandle<TResult> {
  const overlayRef: OverlayRef = overlay.create(overlayConfig);
  const handle = new AiesOverlayRef<TResult>(overlayRef, () =>
    playOverlayLeave(overlayRef, surface),
  );

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
  playOverlayEnter(overlayRef, surface);

  if (config?.dismissible === true) {
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
