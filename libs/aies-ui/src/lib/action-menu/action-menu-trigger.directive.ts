import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link ActionMenuComponent}.
 *
 * @example
 * ```html
 * <aies-action-menu [items]="items">
 *   <button type="button" aies-button aiesActionMenuTrigger variant="secondary" size="sm">
 *     More
 *   </button>
 * </aies-action-menu>
 * ```
 */
@Directive({
  selector: '[aiesActionMenuTrigger]',
  standalone: true,
})
export class ActionMenuTriggerDirective {}
