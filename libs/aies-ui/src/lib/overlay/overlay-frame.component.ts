import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

/**
 * Marks projected chrome as the non-scrolling overlay header (title + close).
 *
 * @example
 * ```html
 * <aies-overlay-frame>
 *   <div aiesOverlayHeader class="flex items-start justify-between gap-3 pb-4">
 *     <h2>Edit shipment</h2>
 *     <button type="button" aies-button variant="ghost" size="sm" aria-label="Close">…</button>
 *   </div>
 *   …
 * </aies-overlay-frame>
 * ```
 */
@Directive({
  selector: '[aiesOverlayHeader]',
  standalone: true,
})
export class OverlayHeaderDirective {}

/**
 * Marks projected chrome as the non-scrolling overlay footer (actions).
 *
 * @example
 * ```html
 * <aies-overlay-frame>
 *   …
 *   <div aiesOverlayFooter class="flex justify-end gap-2 pt-4">
 *     <button type="button" aies-button variant="ghost">Cancel</button>
 *     <button type="button" aies-button variant="primary">Save</button>
 *   </div>
 * </aies-overlay-frame>
 * ```
 */
@Directive({
  selector: '[aiesOverlayFooter]',
  standalone: true,
})
export class OverlayFooterDirective {}

/**
 * Header / scroll body / footer shell for {@link ModalService} and
 * {@link DrawerService} panels.
 *
 * WHY: the pane must not scroll. Overlay scrollbars sit on the right edge and
 * cover a top-right close control or bottom-right actions. This frame keeps
 * header and footer outside the scrollport; only the default slot scrolls,
 * with `.aies-overlay-scroll` reserving a scrollbar gutter.
 *
 * Put `overflow-hidden` on the hosted component host so the pane child
 * does not become a second scroller (a Tailwind utility wins the base rule
 * on `.aies-modal-panel > *`).
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-edit-modal',
 *   standalone: true,
 *   imports: [OverlayFrameComponent, OverlayHeaderDirective, OverlayFooterDirective],
 *   host: { class: 'flex min-h-0 w-full flex-col overflow-hidden' },
 *   template: `
 *     <aies-overlay-frame>
 *       <div aiesOverlayHeader>…title + close…</div>
 *       …form fields…
 *       <div aiesOverlayFooter>…Cancel / Save…</div>
 *     </aies-overlay-frame>
 *   `,
 * })
 * export class EditModal {}
 * ```
 */
@Component({
  selector: 'aies-overlay-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 w-full flex-1 flex-col overflow-hidden',
  },
  template: `
    <div class="shrink-0">
      <ng-content select="[aiesOverlayHeader]" />
    </div>
    <div
      class="aies-overlay-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
    >
      <ng-content />
    </div>
    <div class="shrink-0">
      <ng-content select="[aiesOverlayFooter]" />
    </div>
  `,
})
export class OverlayFrameComponent {}
