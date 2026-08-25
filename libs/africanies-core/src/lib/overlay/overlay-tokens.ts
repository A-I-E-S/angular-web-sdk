import { InjectionToken, type Type } from '@angular/core';

import type { Observable } from 'rxjs';

import type { OverlayRouteConfig } from './overlay-route.types';

/**
 * Handle returned by modal/drawer openers so route sync can close and
 * observe dismissal without depending on `@africanies/africanies-ui`.
 *
 * @typeParam TResult - Value passed to `close(result)` by the overlay content.
 */
export interface OverlayHandle<TResult = unknown> {
  /**
   * Closes the overlay, optionally with a result.
   *
   * @param result - Value forwarded to `afterClosed` subscribers.
   */
  close(result?: TResult): void;

  /**
   * Emits once when the overlay finishes closing, then completes.
   */
  afterClosed(): Observable<TResult | undefined>;
}

/**
 * Minimal opener contract implemented by UI `ModalService` / `DrawerService`.
 *
 * Defined in `africanies-core` (and provided from `africanies-ui`) so route-driven
 * overlays do not create a circular package dependency.
 */
export interface OverlayOpener {
  /**
   * Opens `component` in an overlay host.
   *
   * @param component - Standalone component type to instantiate.
   * @param config - Optional data bag (other query params) and close behavior.
   */
  open<TData = unknown, TResult = unknown>(
    component: Type<unknown>,
    config?: { data?: TData; dismissible?: boolean },
  ): OverlayHandle<TResult>;
}

/**
 * Optional token for the app's modal opener (provided by `@africanies/africanies-ui`).
 *
 * {@link RouteOverlayService} injects this with `{ optional: true }` so apps
 * can register route overlays before UI is wired — opens are skipped until
 * a provider exists.
 */
export const MODAL_SERVICE = new InjectionToken<OverlayOpener>(
  'AFRICANIES_MODAL_SERVICE',
);

/**
 * Optional token for the app's drawer opener (provided by `@africanies/africanies-ui`).
 *
 * Same optional pattern as {@link MODAL_SERVICE}.
 */
export const DRAWER_SERVICE = new InjectionToken<OverlayOpener>(
  'AFRICANIES_DRAWER_SERVICE',
);

/**
 * DI token for the list of {@link OverlayRouteConfig} registered via
 * {@link provideOverlayRoutes}.
 */
export const OVERLAY_ROUTE_CONFIGS = new InjectionToken<OverlayRouteConfig[]>(
  'AFRICANIES_OVERLAY_ROUTE_CONFIGS',
);
