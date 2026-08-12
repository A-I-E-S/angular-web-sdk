import { NgModule } from '@angular/core';

import { StepDefDirective, StepperComponent } from '../stepper';

const STEPPER = [StepperComponent, StepDefDirective] as const;

/**
 * Stepper (+ `aiesStepDef`).
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesStepperModule],
 * })
 * export class WizardModule {}
 * ```
 */
@NgModule({
  imports: [...STEPPER],
  exports: [...STEPPER],
})
export class AiesStepperModule {}
