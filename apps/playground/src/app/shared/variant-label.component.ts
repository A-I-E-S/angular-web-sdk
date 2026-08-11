import { Component, input } from '@angular/core';

/**
 * Small label under a demo control describing the variant being shown.
 */
@Component({
  selector: 'app-variant-label',
  standalone: true,
  template: `
    <div class="flex flex-col items-start gap-2">
      <ng-content />
      <span class="text-caption text-neutral-600 dark:text-neutral-400">{{ label() }}</span>
    </div>
  `,
})
export class VariantLabelComponent {
  /** Caption under the control. */
  readonly label = input.required<string>();
}
