import { NgModule } from '@angular/core';

import { StepDefDirective, StepperComponent } from '../stepper';

const STEPPER = [StepperComponent, StepDefDirective] as const;

/**
 * Stepper (+ `africaniesStepDef`).
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AfricaniesStepperModule],
 * })
 * export class WizardModule {}
 * ```
 */
@NgModule({
  imports: [...STEPPER],
  exports: [...STEPPER],
})
export class AfricaniesStepperModule {}
