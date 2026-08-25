import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Implicit context for templates registered with {@link StepDefDirective}.
 *
 * Reserved for future step-local helpers; bodies typically ignore it and
 * bind parent component fields directly.
 */
export interface StepDefContext {
  /** Step key matching {@link StepDefinition.key}. */
  $implicit: string;
}

/**
 * Registers projected step body content against a step key for
 * {@link StepperComponent}.
 *
 * WHY the same pattern as {@link CellDefDirective}: the stepper owns header
 * navigation chrome, while each step's form/content stays fully
 * consumer-defined with no coupling into StepperComponent.
 *
 * @example
 * ```html
 * <ng-template africaniesStepDef="cargo">
 *   <app-cargo-form [(value)]="cargo" />
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[africaniesStepDef]',
  standalone: true,
})
export class StepDefDirective {
  /** Template projected as the active step body. */
  readonly template = inject(TemplateRef<StepDefContext>);

  /**
   * Step key this template binds to — must match a {@link StepDefinition.key}.
   */
  readonly africaniesStepDef = input.required<string>();
}
