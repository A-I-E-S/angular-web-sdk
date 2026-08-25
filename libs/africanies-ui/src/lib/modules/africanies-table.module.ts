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
 * Table (+ `africaniesCellDef`) and pagination.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AfricaniesTableModule],
 * })
 * export class ShipmentsListModule {}
 * ```
 */
@NgModule({
  imports: [...DATA],
  exports: [...DATA],
})
export class AfricaniesTableModule {}
