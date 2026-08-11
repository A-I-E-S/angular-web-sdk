/**
 * Navigation chrome: breadcrumb, tabs, and segment.
 *
 * Items share {@link AiesNavItem}. Optional `routerLink` hooks into the
 * consumer’s Angular Router; otherwise selection is local via `activeId`.
 */

export type { AiesNavItem } from './nav-item';
export { isNavItemActive, navItemUrlTree } from './nav-router.util';

export { BreadcrumbComponent } from './breadcrumb';

export {
  TabDefDirective,
  TabsComponent,
  type TabDefContext,
} from './tabs';

export { SegmentComponent } from './segment';
