import { NgModule } from '@angular/core';

import { PaginationComponent } from '../pagination';
import { CellDefDirective, RowDetailDefDirective, TableComponent } from '../table';

const DATA = [
  TableComponent,
  CellDefDirective,
  RowDetailDefDirective,
  PaginationComponent,
] as const;

/**
 * Table (+ `aiesCellDef`) and pagination.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesTableModule],
 * })
 * export class ShipmentsListModule {}
 * ```
 */
@NgModule({
  imports: [...DATA],
  exports: [...DATA],
})
export class AiesTableModule {}
