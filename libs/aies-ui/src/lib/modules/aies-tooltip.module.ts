import { NgModule } from '@angular/core';

import {
  TooltipComponent,
  TooltipTriggerDirective,
} from '../tooltip';

const TOOLTIP = [TooltipComponent, TooltipTriggerDirective] as const;

/**
 * Tooltip (+ `aiesTooltipTrigger`).
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesTooltipModule],
 * })
 * export class FormHintsModule {}
 * ```
 */
@NgModule({
  imports: [...TOOLTIP],
  exports: [...TOOLTIP],
})
export class AiesTooltipModule {}
