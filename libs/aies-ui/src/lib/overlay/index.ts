/**
 * Programmatic overlay system (modal, drawer, confirm).
 *
 * Openers implement `@aies/aies-core` {@link OverlayOpener} and are bound to
 * {@link MODAL_SERVICE} / {@link DRAWER_SERVICE} via {@link provideAiesUiOverlays}.
 */
export { AiesOverlayRef } from './aies-overlay-ref';
export { ConfirmDialogComponent } from './confirm-dialog.component';
export type { ConfirmOptions } from './confirm-options';
export { ConfirmService } from './confirm.service';
export { DrawerService } from './drawer.service';
export { ModalService } from './modal.service';
export { OVERLAY_DATA } from './overlay-data.token';
export type { OverlayOpenConfig } from './overlay-attach';
export { provideAiesUiOverlays } from './provide-aies-ui-overlays';
