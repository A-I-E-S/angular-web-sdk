import { Directive, inject, input, TemplateRef } from '@angular/core';

import type { CellDefContext } from './cell-def.directive';

/**
 * Implicit context for {@link RowDetailDefDirective} templates — same shape as
 * {@link CellDefContext} (`let-row` on the projected template).
 */
export type RowDetailDefContext<T = unknown> = CellDefContext<T>;

/**
 * Registers a label / value pair inside an expanded table row.
 *
 * The attribute value is the visible label; the template body is the value
 * and may host any component (chips, links, nested controls, …).
 *
 * @example
 * ```html
 * <ng-template aiesRowDetail="Carrier" let-row>
 *   <aies-chip variant="neutral">{{ row.carrier }}</aies-chip>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[aiesRowDetail]',
  standalone: true,
})
export class RowDetailDefDirective {
  /** Template rendered as the detail value. */
  readonly template = inject(TemplateRef<RowDetailDefContext>);

  /** Visible label in the expanded detail grid. */
  readonly label = input.required<string>({ alias: 'aiesRowDetail' });
}
