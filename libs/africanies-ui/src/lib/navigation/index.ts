/**
 * Navigation chrome: breadcrumb, tabs, segment, side nav, and shipping mode.
 *
 * Items share {@link AfricaniesNavItem} (tabs / segment / breadcrumb). Side nav uses
 * {@link AfricaniesSideNavItem} (icons + nested children). Optional `routerLink`
 * hooks into the consumer’s Angular Router; otherwise selection is local via
 * `activeId`.
 */

export { BreadcrumbComponent } from './breadcrumb';
export {
  buildBreadcrumbsFromSideNav,
  type ContentBackTarget,
  type HeaderBackTarget,
  isCatalogRootRoute,
  isNestedChildRoute,
  normalizeNavPath,
  resolveActiveSideNavItem,
  resolveCatalogRootLink,
  resolveContentBackTarget,
  resolveHeaderBackTarget,
  resolveParentPathFromRootSnapshot,
} from './header-back.util';
export type { AfricaniesNavItem } from './nav-item';
export { isNavItemActive, navItemUrlTree } from './nav-router.util';
export {
  isModifiedClick,
  navigateNavItem,
  navItemHref,
} from './navigate-nav-item';
export { SegmentComponent } from './segment';
export { ShippingModeSwitchComponent } from './shipping-mode-switch';
export {
  type AfricaniesSideNavItem,
  SideNavComponent,
} from './side-nav';
export {
  type TabDefContext,
  TabDefDirective,
  TabsComponent,
} from './tabs';
