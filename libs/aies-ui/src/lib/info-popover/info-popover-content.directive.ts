import { Directive } from '@angular/core';

/**
 * Marks projected content as the panel body for {@link InfoPopoverComponent}.
 *
 * Any component or markup can be projected — lists, forms, custom layouts, etc.
 *
 * @example
 * ```html
 * <aies-info-popover title="Zones Available">
 *   <ul aiesInfoPopoverContent class="space-y-1">
 *     @for (zone of zones; track zone) {
 *       <li>{{ zone }}</li>
 *     }
 *   </ul>
 * </aies-info-popover>
 * ```
 */
@Directive({
  selector: '[aiesInfoPopoverContent]',
  standalone: true,
})
export class InfoPopoverContentDirective {}
