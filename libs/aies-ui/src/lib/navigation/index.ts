/**
 * Navigation chrome: breadcrumb, tabs, segment, and side nav.
 *
 * Items share {@link AiesNavItem} (tabs / segment / breadcrumb). Side nav uses
 * {@link AiesSideNavItem} (icons + nested children). Optional `routerLink`
 * hooks into the consumer’s Angular Router; otherwise selection is local via
 * `activeId`.
 */

export { BreadcrumbComponent } from './breadcrumb';
export type { AiesNavItem } from './nav-item';
export { isNavItemActive, navItemUrlTree } from './nav-router.util';
export { SegmentComponent } from './segment';
export {
  type AiesSideNavItem,
  SideNavComponent,
} from './side-nav';
export {
  type TabDefContext,
  TabDefDirective,
  TabsComponent,
} from './tabs';
