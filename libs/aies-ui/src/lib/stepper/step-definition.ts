/**
 * One step in a {@link StepperComponent} wizard.
 *
 * Header chrome (label, number/check) is driven by this definition; the step
 * *body* is a projected `<ng-template aiesStepDef="key">`.
 */
export interface StepDefinition {
  /** Stable id — must match an `aiesStepDef` template key. */
  key: string;

  /** Label shown in the step header. */
  label: string;

  /**
   * When explicitly `false`, linear mode blocks navigating *forward* past
   * this step. `undefined` / `true` are treated as valid.
   *
   * WHY optional rather than defaulting to `true`: parents often derive
   * validity from form state that is not ready on the first CD cycle —
   * omitting the flag until known avoids falsely locking the wizard.
   */
  isValid?: boolean;
}
