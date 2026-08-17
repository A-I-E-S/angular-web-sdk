/**
 * Programmatic overlay system (modal, drawer, confirm).
 *
 * Openers implement `@aies/aies-core` {@link OverlayOpener} and are bound to
 * {@link MODAL_SERVICE} / {@link DRAWER_SERVICE} via {@link provideAiesUiOverlays}.
 */
export { AiesOverlayRef } from './aies-overlay-ref';
export { ConfirmService } from './confirm.service';
export { ConfirmDialogComponent } from './confirm-dialog.component';
export type { ConfirmOptions, ConfirmWork } from './confirm-options';
export { DrawerService } from './drawer.service';
export { ModalService, type ModalOpenConfig } from './modal.service';
export { type ModalSize, MODAL_SIZE_PANEL_CLASS } from './modal-size';
export type { OverlayOpenConfig } from './overlay-attach';
export { OVERLAY_DATA } from './overlay-data.token';
export {
  OverlayFooterDirective,
  OverlayFrameComponent,
  OverlayHeaderDirective,
} from './overlay-frame.component';
export { provideAiesUiOverlays } from './provide-aies-ui-overlays';
