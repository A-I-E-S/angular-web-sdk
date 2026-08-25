import { Directive } from '@angular/core';

/**
 * Marks projected content as the panel body for {@link InfoPopoverComponent}.
 *
 * Any component or markup can be projected — lists, forms, custom layouts, etc.
 *
 * @example
 * ```html
 * <africanies-info-popover title="Zones Available">
 *   <ul africaniesInfoPopoverContent class="space-y-1">
 *     @for (zone of zones; track zone) {
 *       <li>{{ zone }}</li>
 *     }
 *   </ul>
 * </africanies-info-popover>
 * ```
 */
@Directive({
  selector: '[africaniesInfoPopoverContent]',
  standalone: true,
})
export class InfoPopoverContentDirective {}
