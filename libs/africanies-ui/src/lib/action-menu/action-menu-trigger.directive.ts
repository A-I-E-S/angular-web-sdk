import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link ActionMenuComponent}.
 *
 * @example
 * ```html
 * <africanies-action-menu [items]="items">
 *   <button type="button" africanies-button africaniesActionMenuTrigger variant="secondary" size="sm">
 *     More
 *   </button>
 * </africanies-action-menu>
 * ```
 */
@Directive({
  selector: '[africaniesActionMenuTrigger]',
  standalone: true,
})
export class ActionMenuTriggerDirective {}
