import { Directive } from '@angular/core';

/**
 * Marks projected content as the custom trigger for {@link TooltipComponent}.
 *
 * When present, the default info icon is hidden and this element owns open
 * interactions (hover / focus / click bubble to the tooltip host).
 *
 * @example
 * ```html
 * <africanies-tooltip text="Required for insured shipments.">
 *   <button type="button" africanies-button africaniesTooltipTrigger variant="ghost" size="sm">
 *     Why?
 *   </button>
 * </africanies-tooltip>
 * ```
 */
@Directive({
  selector: '[africaniesTooltipTrigger]',
  standalone: true,
})
export class TooltipTriggerDirective {}
