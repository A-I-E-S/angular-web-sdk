import { NgModule } from '@angular/core';

import { AvatarComponent, AvatarMenuComponent } from '../avatar';
import { BrandLogoComponent } from '../brand';
import {
  AppShellComponent,
  AppShellHeaderComponent,
  AppShellHeaderEndDirective,
  AppShellHeaderSlotDirective,
  AppShellHeaderStartDirective,
} from '../layout';
import { BreadcrumbComponent } from '../navigation/breadcrumb';
import { SegmentComponent } from '../navigation/segment';
import { SideNavComponent } from '../navigation/side-nav';
import { TabDefDirective, TabsComponent } from '../navigation/tabs';

const NAV = [
  AppShellComponent,
  AppShellHeaderComponent,
  AppShellHeaderEndDirective,
  AppShellHeaderSlotDirective,
  AppShellHeaderStartDirective,
  BrandLogoComponent,
  AvatarComponent,
  AvatarMenuComponent,
  BreadcrumbComponent,
  TabsComponent,
  TabDefDirective,
  SegmentComponent,
  SideNavComponent,
] as const;

/**
 * App shell, breadcrumb, tabs (+ `aiesTabDef`), segment, side nav, brand logo,
 * avatar menu, and shell header chrome.
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
