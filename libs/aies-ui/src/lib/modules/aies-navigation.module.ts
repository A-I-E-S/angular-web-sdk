import { NgModule } from '@angular/core';

import { BreadcrumbComponent } from '../navigation/breadcrumb';
import { SegmentComponent } from '../navigation/segment';
import { TabDefDirective, TabsComponent } from '../navigation/tabs';

const NAV = [
  BreadcrumbComponent,
  TabsComponent,
  TabDefDirective,
  SegmentComponent,
] as const;

/**
 * Breadcrumb, tabs (+ `aiesTabDef`), and segment.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesNavigationModule],
 * })
 * export class ShellModule {}
 * ```
 */
@NgModule({
  imports: [...NAV],
  exports: [...NAV],
})
export class AiesNavigationModule {}
