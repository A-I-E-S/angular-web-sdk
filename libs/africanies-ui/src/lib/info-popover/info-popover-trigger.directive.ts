import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link InfoPopoverComponent}.
 *
 * When present, the default info icon is hidden and this element owns open
 * interactions (hover / focus / click bubble to the popover host).
 *
 * @example
 * ```html
 * <africanies-info-popover title="Zones">
 *   <button type="button" africaniesInfoPopoverTrigger>Show zones</button>
 *   <ul africaniesInfoPopoverContent>…</ul>
 * </africanies-info-popover>
 * ```
 */
@Directive({
  selector: '[africaniesInfoPopoverTrigger]',
  standalone: true,
})
export class InfoPopoverTriggerDirective {}
