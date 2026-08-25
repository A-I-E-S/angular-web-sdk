import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Registers a projected header cell template against a column key for
 * {@link TableComponent}.
 *
 * When present, the table renders the template instead of the plain
 * `col.header` text for the matching column.
 *
 * @example
 * ```html
 * <ng-template africaniesHeaderCellDef="checkbox">
 *   <africanies-checkbox label="" [value]="allChecked()" (valueChange)="toggleAll($event)" />
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[africaniesHeaderCellDef]',
  standalone: true,
})
export class HeaderCellDefDirective {
  /** Template projected into the matching column header cell. */
  readonly template = inject(TemplateRef);

  /**
   * Column key this template binds to — must match a {@link TableColumn.key}.
   */
  readonly africaniesHeaderCellDef = input.required<string>();
}
