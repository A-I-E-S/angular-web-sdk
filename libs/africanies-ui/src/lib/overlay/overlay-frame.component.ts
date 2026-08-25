import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

/**
 * Marks projected chrome as the non-scrolling overlay header (title + close).
 *
 * @example
 * ```html
 * <africanies-overlay-frame>
 *   <div africaniesOverlayHeader class="flex items-start justify-between gap-3 pb-4">
 *     <h2>Edit shipment</h2>
 *     <button type="button" africanies-button variant="ghost" size="sm" aria-label="Close">…</button>
 *   </div>
 *   …
 * </africanies-overlay-frame>
 * ```
 */
@Directive({
  selector: '[africaniesOverlayHeader]',
  standalone: true,
})
export class OverlayHeaderDirective {}

/**
 * Marks projected chrome as the non-scrolling overlay footer (actions).
 *
 * @example
 * ```html
 * <africanies-overlay-frame>
 *   …
 *   <div africaniesOverlayFooter class="flex justify-end gap-2 pt-4">
 *     <button type="button" africanies-button variant="ghost">Cancel</button>
 *     <button type="button" africanies-button variant="primary">Save</button>
 *   </div>
 * </africanies-overlay-frame>
 * ```
 */
@Directive({
  selector: '[africaniesOverlayFooter]',
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
 * with `.africanies-overlay-scroll` reserving a scrollbar gutter.
 *
 * Put `overflow-hidden` on the hosted component host so the pane child
 * does not become a second scroller (a Tailwind utility wins the base rule
 * on `.africanies-modal-panel > *`).
 *
 * @example
 * ```ts
 * @Component({
 *   selector: 'app-edit-modal',
 *   standalone: true,
 *   imports: [OverlayFrameComponent, OverlayHeaderDirective, OverlayFooterDirective],
 *   host: { class: 'flex min-h-0 w-full flex-col overflow-hidden' },
 *   template: `
 *     <africanies-overlay-frame>
 *       <div africaniesOverlayHeader>…title + close…</div>
 *       …form fields…
 *       <div africaniesOverlayFooter>…Cancel / Save…</div>
 *     </africanies-overlay-frame>
 *   `,
 * })
 * export class EditModal {}
 * ```
 */
@Component({
  selector: 'africanies-overlay-frame',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex min-h-0 w-full flex-1 flex-col overflow-hidden',
  },
  template: `
    <div class="shrink-0">
      <ng-content select="[africaniesOverlayHeader]" />
    </div>
    <div
      class="africanies-overlay-scroll min-h-0 flex-1 overflow-x-clip overflow-y-auto px-[2px] -mx-[2px]"
    >
      <ng-content />
    </div>
    <div class="shrink-0">
      <ng-content select="[africaniesOverlayFooter]" />
    </div>
  `,
})
export class OverlayFrameComponent {}
