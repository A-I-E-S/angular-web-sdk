import { DRAWER_SERVICE, MODAL_SERVICE } from '@aies/aies-core';
import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import { ConfirmService } from './confirm.service';
import { DrawerService } from './drawer.service';
import { ModalService } from './modal.service';

/**
 * Registers programmatic overlay openers and binds core DI tokens.
 *
 * Call beside {@link provideOverlayRoutes} so route-driven overlays can
 * resolve {@link MODAL_SERVICE} / {@link DRAWER_SERVICE}. Also registers
 * {@link ConfirmService} because it depends on {@link ModalService}.
 *
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * import { provideOverlayRoutes } from '@aies/aies-core';
 * import { provideAiesUiOverlays } from '@aies/aies-ui';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAiesUiOverlays(),
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
export function provideAiesUiOverlays(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ModalService,
    DrawerService,
    ConfirmService,
    { provide: MODAL_SERVICE, useExisting: ModalService },
    { provide: DRAWER_SERVICE, useExisting: DrawerService },
  ]);
}
