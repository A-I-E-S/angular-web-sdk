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
import { ShippingModeSwitchComponent } from '../navigation/shipping-mode-switch';
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
  ShippingModeSwitchComponent,
  SideNavComponent,
] as const;

/**
 * App shell, breadcrumb, tabs (+ `aiesTabDef`), segment, side nav, shipping
 * mode switch, brand logo, avatar menu, and shell header chrome.
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
