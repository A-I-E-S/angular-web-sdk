import { NgModule } from '@angular/core';

import {
  TooltipComponent,
  TooltipTriggerDirective,
} from '../tooltip';

const TOOLTIP = [TooltipComponent, TooltipTriggerDirective] as const;

/**
 * Tooltip (+ `africaniesTooltipTrigger`).
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AfricaniesTooltipModule],
 * })
 * export class FormHintsModule {}
 * ```
 */
@NgModule({
  imports: [...TOOLTIP],
  exports: [...TOOLTIP],
})
export class AfricaniesTooltipModule {}
