import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link TooltipComponent}.
 *
 * When present, the default info icon is hidden and this element owns open
 * interactions (hover / focus / click bubble to the tooltip host).
 *
 * @example
 * ```html
 * <aies-tooltip text="Required for insured shipments.">
 *   <button type="button" aies-button aiesTooltipTrigger variant="ghost" size="sm">
 *     Why?
 *   </button>
 * </aies-tooltip>
 * ```
 */
@Directive({
  selector: '[aiesTooltipTrigger]',
  standalone: true,
})
export class TooltipTriggerDirective {}
