import type { IsActiveMatchOptions, Router, UrlTree } from '@angular/router';

import type { AiesNavItem } from './nav-item';

/**
 * Builds a {@link UrlTree} for an item’s `routerLink` / query / fragment.
 *
 * @param router - Consumer app router.
 * @param item - Nav item with a `routerLink`.
 * @returns UrlTree, or `null` when the item is not routed.
 */
export function navItemUrlTree(
  router: Router,
  item: AiesNavItem,
): UrlTree | null {
  if (item.routerLink == null) {
    return null;
  }
  const commands = Array.isArray(item.routerLink)
    ? [...item.routerLink]
    : [item.routerLink];
  return router.createUrlTree(commands, {
    queryParams: item.queryParams,
    fragment: item.fragment,
  });
}

/**
 * Whether the current router URL matches this item (cold load + navigations).
 *
 * @param router - Consumer app router.
 * @param item - Nav item with a `routerLink`.
 * @param options - Same shape as `RouterLinkActive` options.
 * @returns True when the current URL matches the item.
 */
export function isNavItemActive(
  router: Router,
  item: AiesNavItem,
  options: IsActiveMatchOptions,
): boolean {
  const tree = navItemUrlTree(router, item);
  if (!tree) {
    return false;
  }
  return router.isActive(tree, options);
}
