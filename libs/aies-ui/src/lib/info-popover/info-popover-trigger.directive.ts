import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link InfoPopoverComponent}.
 *
 * When present, the default info icon is hidden and this element owns open
 * interactions (hover / focus / click bubble to the popover host).
 *
 * @example
 * ```html
 * <aies-info-popover title="Zones">
 *   <button type="button" aiesInfoPopoverTrigger>Show zones</button>
 *   <ul aiesInfoPopoverContent>…</ul>
 * </aies-info-popover>
 * ```
 */
@Directive({
  selector: '[aiesInfoPopoverTrigger]',
  standalone: true,
})
export class InfoPopoverTriggerDirective {}
