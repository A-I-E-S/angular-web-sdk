import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import type { OverlayRouteConfig } from './overlay-route.types';
import { OVERLAY_ROUTE_CONFIGS } from './overlay-tokens';
import { RouteOverlayService } from './route-overlay.service';

/**
 * Registers query-param → overlay maps and eagerly starts {@link RouteOverlayService}.
 *
 * Call beside {@link provideAiesSdk} in `app.config.ts`. Modal/drawer openers
 * must still be provided by `@aies/aies-ui` (`MODAL_SERVICE` / `DRAWER_SERVICE`).
 *
 * @param configs - One or more param-key namespaces (e.g. `modal` and `drawer`).
 * @returns Environment providers including an app initializer.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { provideRouter, Routes } from '@angular/router';
 * import {
 *   provideAiesSdk,
 *   provideOverlayRoutes,
 * } from '@aies/aies-core';
 * import { EditShipmentModal } from './edit-shipment.modal';
 *
 * export const appConfig = {
 *   providers: [
 *     provideAiesSdk({ baseUrl: 'https://api.example.com' }),
 *     provideRouter(routes),
 *     provideOverlayRoutes([
 *       {
 *         paramKey: 'modal',
 *         routes: {
 *           'edit-shipment': {
 *             component: EditShipmentModal,
 *             overlay: 'modal',
 *           },
 *         },
 *       },
 *     ]),
 *     // From @aies/aies-ui — binds MODAL_SERVICE / DRAWER_SERVICE
 *     // provideAiesOverlays(),
 *   ],
 * };
 *
 * // Template — open via query params (refresh with the same URL reopens):
 * // <a routerLink="." [queryParams]="{ modal: 'edit-shipment', id: row.id }">
 * //   Edit
 * // </a>
 * ```
 */
export function provideOverlayRoutes(
  configs: OverlayRouteConfig[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: OVERLAY_ROUTE_CONFIGS, useValue: configs },
    RouteOverlayService,
    provideAppInitializer(() => {
      // Force construction so queryParamMap subscription starts at bootstrap
      // (including hard refresh when the param is already present).
      inject(RouteOverlayService);
    }),
  ]);
}
