import type { Router, UrlTree } from '@angular/router';

import type { NavRouteTarget } from './nav-router.util';
import { navItemUrlTree } from './nav-router.util';

/**
 * Whether a click should leave navigation to the browser (new tab, etc.).
 * @param event - Mouse click from a routed nav control.
 * @returns True when the host should not call `preventDefault` / navigate.
 */
export function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/**
 * Serialized href for a routed nav item (for `<a href>` without RouterLink).
 * @param router - App router.
 * @param item - Nav item with `routerLink`.
 * @returns Path string, or `null` when the item is not routed.
 */
export function navItemHref(
  router: Router,
  item: NavRouteTarget,
): string | null {
  const tree = navItemUrlTree(router, item);
  return tree ? router.serializeUrl(tree) : null;
}

/**
 * Navigate to a nav item without jumping the viewport to the top.
 *
 * Apps that enable `withInMemoryScrolling({ scrollPositionRestoration:
 * 'enabled' })` scroll to `[0, 0]` on every forward navigation. That is wrong
 * for in-page tabs/segments. Passing `{ scroll: 'manual' }` tells Angular's
 * RouterScroller to skip scrolling for this navigation.
 *
 * @param router - App router.
 * @param item - Nav item with `routerLink`.
 * @param keepScroll - When true (default for tabs/segments), skip router scroll.
 * @returns Navigation promise, or `null` when the item is not routed.
 */
export function navigateNavItem(
  router: Router,
  item: NavRouteTarget,
  keepScroll = true,
): Promise<boolean> | null {
  const tree: UrlTree | null = navItemUrlTree(router, item);
  if (!tree) {
    return null;
  }
  return router.navigateByUrl(
    tree,
    keepScroll ? { scroll: 'manual' } : undefined,
  );
}
