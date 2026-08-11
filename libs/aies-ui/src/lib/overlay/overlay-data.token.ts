import { InjectionToken } from '@angular/core';

/**
 * DI token for data passed into an overlay-hosted component via
 * {@link ModalService.open} / {@link DrawerService.open}.
 *
 * WHY a token (not constructor args): CDK `ComponentPortal` instantiates the
 * component through DI, so callers cannot pass constructor parameters. Route
 * overlays also forward sibling query params through this same token.
 *
 * @typeParam T - Shape of `config.data` for the opened component.
 *
 * @example
 * ```ts
 * readonly data = inject<EditShipmentData>(OVERLAY_DATA);
 * ```
 */
export const OVERLAY_DATA = new InjectionToken<unknown>('AIES_OVERLAY_DATA');
