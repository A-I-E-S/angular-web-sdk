import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import { DRAWER_SERVICE, MODAL_SERVICE } from '@africanies/africanies-core';

import { FilterDrawerService } from '../filters/filter-drawer.service';
import { ConfirmService } from './confirm.service';
import { DrawerService } from './drawer.service';
import { ModalService } from './modal.service';

/**
 * Registers programmatic overlay openers and binds core DI tokens.
 *
 * Call beside {@link provideOverlayRoutes} so route-driven overlays can
 * resolve {@link MODAL_SERVICE} / {@link DRAWER_SERVICE}. Also registers
 * {@link ConfirmService} and {@link FilterDrawerService} (both need overlay openers).
 *
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * import { provideOverlayRoutes } from '@africanies/africanies-core';
 * import { provideAfricaniesUiOverlays } from '@africanies/africanies-ui';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAfricaniesUiOverlays(),
 *     provideOverlayRoutes([
 *       {
 *         paramKey: 'modal',
 *         routes: {
 *           'edit-shipment': { component: EditShipmentModal, overlay: 'modal' },
 *         },
 *       },
 *     ]),
 *   ],
 * };
 * ```
 */
export function provideAfricaniesUiOverlays(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ModalService,
    DrawerService,
    ConfirmService,
    FilterDrawerService,
    { provide: MODAL_SERVICE, useExisting: ModalService },
    { provide: DRAWER_SERVICE, useExisting: DrawerService },
  ]);
}
