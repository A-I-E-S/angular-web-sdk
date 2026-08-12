import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Implicit context passed to templates registered with {@link CellDefDirective}.
 *
 * @typeParam T - Row record type mirrored from {@link TableComponent}.
 */
export interface CellDefContext<T = unknown> {
  /** Current row — available as `let-row` on the projected template. */
  $implicit: T;
}

/**
 * Registers a projected cell template against a column key for
 * {@link TableComponent}.
 *
 * WHY a structural-style directive: mirrors Angular CDK Table's split between
 * column *definition* (`columns` input) and cell *content* (projected
 * templates) so a cell can host badges, buttons, nested components — not just
 * text — without TableComponent knowing about those UIs.
 *
 * @example
 * ```html
 * <ng-template aiesCellDef="status" let-row>
 *   <aies-chip [variant]="statusVariant(row.status)">{{ row.status }}</aies-chip>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[aiesCellDef]',
  standalone: true,
})
export class CellDefDirective {
  /** Template projected into matching column body cells. */
  readonly template = inject(TemplateRef<CellDefContext>);

  /**
   * Column key this template binds to — must match a {@link TableColumn.key}.
   */
  readonly aiesCellDef = input.required<string>();
}
