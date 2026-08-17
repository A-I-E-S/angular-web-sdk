import type { ActivatedRouteSnapshot } from '@angular/router';

import type { AiesNavItem } from './nav-item';
import type { AiesSideNavItem } from './side-nav';

/** Router target for the app-shell header back control. */
export interface HeaderBackTarget {
  routerLink: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  fragment?: string;
}

/** Back target for the app-shell content chrome. */
export type ContentBackTarget = HeaderBackTarget;

/**
 * Resolve the parent route for the header Back button.
 *
 * Walks breadcrumbs from the current page toward root and uses the nearest
 * ancestor with a `routerLink`, unless {@link backLink} is set explicitly.
 *
 * @param breadcrumbs - Trail with the current page last.
 * @param backLink - Optional explicit destination.
 * @returns Parent router target, or `null` when there is none.
 */
export function resolveHeaderBackTarget(
  breadcrumbs: AiesNavItem[],
  backLink?: string | readonly unknown[] | null,
): HeaderBackTarget | null {
  if (backLink != null) {
    return { routerLink: backLink };
  }

  for (let index = breadcrumbs.length - 2; index >= 0; index -= 1) {
    const candidate = breadcrumbs[index];
    if (candidate.routerLink == null || candidate.disabled) {
      continue;
    }
    return {
      routerLink: candidate.routerLink,
      queryParams: candidate.queryParams,
      fragment: candidate.fragment,
    };
  }

  return null;
}

/**
 * Resolve the content-area Back control.
 *
 * Back is shown only when the activated route has a real parent (so a pasted
 * deep link like `/components/navigation/documents` still returns to
 * `/components/navigation`). Catalog pages with no parent route never get Back.
 *
 * When a side-nav item maps the parent to an overview URL, that link is
 * preferred so the redirect hop is skipped. Query params on the current URL
 * (list `page` / filters) are forwarded so Back restores the parent list.
 *
 * @param parentPath - Parent URL from the activated route tree.
 * @param currentUrl - Current router URL.
 * @param catalogRootLink - Optional side-nav root link for the parent.
 * @param backLink - Optional explicit destination.
 * @returns Back router target, or `null` when Back should stay hidden.
 */
export function resolveContentBackTarget(
  parentPath: string | null,
  currentUrl: string,
  catalogRootLink?: string | null,
  backLink?: string | readonly unknown[] | null,
): ContentBackTarget | null {
  if (backLink != null) {
    return { routerLink: backLink };
  }

  if (!parentPath) {
    return null;
  }

  const current = normalizePath(currentUrl);
  const parent = normalizePath(parentPath);
  const catalog = catalogRootLink ? normalizePath(catalogRootLink) : '';

  const target =
    catalog && catalog !== parent && catalog.startsWith(`${parent}/`)
      ? catalog
      : parent;

  if (!target || target === current) {
    return null;
  }

  const queryParams = queryParamsFromUrl(currentUrl);
  return queryParams
    ? { routerLink: target, queryParams }
    : { routerLink: target };
}

/**
 * Parent URL of the deepest activated route, or `null` when the leaf sits at
 * the app root (no parent route).
 *
 * Derived from the route tree, so it works after reload or a pasted URL.
 *
 * @param root - Router state root snapshot.
 * @returns Parent path, or `null` at the app root.
 */
export function resolveParentPathFromRootSnapshot(
  root: ActivatedRouteSnapshot,
): string | null {
  const levels: string[][] = [];
  let node: ActivatedRouteSnapshot | null = root;
  while (node) {
    levels.push(node.url.map((segment) => segment.path));
    node = node.firstChild;
  }

  return resolveParentPathFromLevels(levels);
}

/**
 * Parent path from route-tree URL levels (root first, leaf last).
 *
 * Empty-path nodes (the app root, nameless wrappers) are skipped.
 *
 * @param levels - URL segments per route node, root first.
 * @returns Parent path, or `null` when the leaf has no parent route.
 */
export function resolveParentPathFromLevels(
  levels: readonly (readonly string[])[],
): string | null {
  if (levels.length < 2) {
    return null;
  }

  const current = joinRouteLevels(levels);
  for (let index = levels.length - 2; index >= 0; index -= 1) {
    const parent = joinRouteLevels(levels.slice(0, index + 1));
    if (parent !== '/' && parent !== current) {
      return parent;
    }
  }

  return null;
}

function joinRouteLevels(levels: readonly (readonly string[])[]): string {
  const segments = levels.flat().filter(Boolean);
  return segments.length ? `/${segments.join('/')}` : '/';
}

/**
 * Parse `?a=1&b=2` from a router URL into a query map.
 *
 * @param url - Router URL, possibly with query or hash.
 * @returns Query record, or `undefined` when none.
 */
function queryParamsFromUrl(url: string): Record<string, string> | undefined {
  const query = url.split('#')[0]?.split('?')[1];
  if (!query) {
    return undefined;
  }
  const params = new URLSearchParams(query);
  const record: Record<string, string> = {};
  params.forEach((value, key) => {
    record[key] = value;
  });
  return Object.keys(record).length ? record : undefined;
}

/**
 * Normalizes a router URL to a comparable path (no query, hash, or trailing slash).
 *
 * @param url - Router URL, possibly with query or hash.
 * @returns Path without query, hash, or trailing slash.
 */
export function normalizeNavPath(url: string): string {
  return normalizePath(url);
}

/**
 * True when the URL is deeper than the matched side-nav item's root link.
 *
 * @param url - Current router URL.
 * @param navItems - Side-nav catalog.
 * @returns Whether the URL is a nested child of a catalog item.
 */
export function isNestedChildRoute(
  url: string,
  navItems: AiesSideNavItem[],
): boolean {
  const path = normalizePath(url);
  const match = findSideNavMatch(path, navItems);
  if (!match) {
    return false;
  }

  const itemLink = normalizePath(asStringLink(match.item.routerLink));
  return path !== itemLink && path.startsWith(match.basePath);
}

/**
 * True when the URL matches a side-nav catalog link (or home).
 *
 * @param url - Current router URL.
 * @param navItems - Side-nav catalog.
 * @returns Whether the URL is a catalog root route.
 */
export function isCatalogRootRoute(
  url: string,
  navItems: AiesSideNavItem[],
): boolean {
  const path = normalizePath(url);
  if (isAppRoot(path, navItems)) {
    return true;
  }

  const match = findSideNavMatch(path, navItems);
  if (!match) {
    return false;
  }

  return normalizePath(asStringLink(match.item.routerLink)) === path;
}

/**
 * Side-nav root link for a URL under a catalog item.
 *
 * @param url - Current router URL.
 * @param navItems - Side-nav catalog.
 * @returns Catalog item `routerLink`, or `null` when unmatched.
 */
export function resolveCatalogRootLink(
  url: string,
  navItems: AiesSideNavItem[],
): string | null {
  const match = findSideNavMatch(normalizePath(url), navItems);
  if (!match) {
    return null;
  }

  const link = asStringLink(match.item.routerLink);
  return link || null;
}

/**
 * Side-nav item that owns the current URL — longest catalog prefix match.
 *
 * Matches nested child routes on cold load (same rules as
 * {@link buildBreadcrumbsFromSideNav}), e.g. App Settings stays active on
 * `/settings/app/shipment-methods/...`.
 *
 * @param url - Current router URL.
 * @param navItems - Side-nav catalog.
 * @returns Matched leaf item, or `null` when the URL is outside the catalog.
 */
export function resolveActiveSideNavItem(
  url: string,
  navItems: AiesSideNavItem[],
): AiesSideNavItem | null {
  return findSideNavMatch(normalizePath(url), navItems)?.item ?? null;
}

/**
 * Build a breadcrumb trail from the current URL and a side-nav catalog.
 *
 * Supports nested child routes under a matched nav item (e.g.
 * `/components/navigation/documents` under Navigation).
 *
 * @param url - Current router URL.
 * @param navItems - Side-nav catalog.
 * @returns Breadcrumb trail with the current page last.
 */
export function buildBreadcrumbsFromSideNav(
  url: string,
  navItems: AiesSideNavItem[],
): AiesNavItem[] {
  const path = normalizePath(url);
  const homeLink = resolveHomeRouterLink(navItems);
  const crumbs: AiesNavItem[] = [
    { id: 'home', label: 'Home', routerLink: homeLink, icon: 'home' },
  ];

  if (isAppRoot(path, navItems)) {
    crumbs.push({ id: 'overview', label: 'Overview' });
    return crumbs;
  }

  const match = findSideNavMatch(path, navItems);
  if (!match) {
    appendPathSegments(crumbs, path, '');
    return finalizeLeaf(crumbs, path);
  }

  if (match.group) {
    crumbs.push({
      id: match.group.id,
      label: match.group.label,
      icon: match.group.icon,
    });
  }

  const itemLink = asStringLink(match.item.routerLink);
  crumbs.push({
    id: match.item.id,
    label: match.item.label,
    routerLink: itemLink,
  });

  if (path !== itemLink) {
    appendPathSegments(crumbs, path, match.basePath);
  }

  return finalizeLeaf(crumbs, path);
}

function normalizePath(url: string): string {
  const path = url.split('?')[0]?.split('#')[0] ?? '/';
  if (path === '/') {
    return '/';
  }
  return path.replace(/\/+$/, '');
}

function resolveHomeRouterLink(navItems: AiesSideNavItem[]): string {
  for (const item of navItems) {
    const link = asStringLink(item.routerLink);
    if (link) {
      return link;
    }
  }

  return '/overview';
}

function isAppRoot(path: string, navItems: AiesSideNavItem[]): boolean {
  if (path === '/') {
    return true;
  }

  return path === normalizePath(resolveHomeRouterLink(navItems));
}

function asStringLink(link: string | readonly unknown[] | undefined): string {
  return typeof link === 'string' ? link : '';
}

function routeBase(link: string): string {
  return link.replace(/\/overview$/, '').replace(/\/+$/, '') || link;
}

function findSideNavMatch(path: string, navItems: AiesSideNavItem[]) {
  let best:
    | {
        group?: Pick<AiesSideNavItem, 'id' | 'label' | 'icon'>;
        item: AiesSideNavItem;
        basePath: string;
      }
    | null = null;

  for (const node of navItems) {
    if (node.children?.length) {
      for (const child of node.children) {
        const link = asStringLink(child.routerLink);
        if (!link) {
          continue;
        }
        const basePath = routeBase(link);
        if (!path.startsWith(basePath)) {
          continue;
        }
        if (!best || basePath.length > best.basePath.length) {
          best = {
            group: { id: node.id, label: node.label, icon: node.icon },
            item: child,
            basePath,
          };
        }
      }
      continue;
    }

    const link = asStringLink(node.routerLink);
    if (!link) {
      continue;
    }
    const basePath = routeBase(link);
    if (!path.startsWith(basePath)) {
      continue;
    }
    if (!best || basePath.length > best.basePath.length) {
      best = { item: node, basePath };
    }
  }

  return best;
}

function appendPathSegments(
  crumbs: AiesNavItem[],
  path: string,
  basePath: string,
): void {
  const remainder = basePath ? path.slice(basePath.length) : path;
  const segments = remainder.split('/').filter(Boolean);
  if (!segments.length) {
    return;
  }

  let acc = basePath;
  for (const segment of segments) {
    acc = `${acc}/${segment}`;
    crumbs.push({
      id: `segment-${segment}`,
      label: titleCaseSegment(segment),
      routerLink: acc,
    });
  }
}

function titleCaseSegment(segment: string): string {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function finalizeLeaf(crumbs: AiesNavItem[], path: string): AiesNavItem[] {
  if (crumbs.length < 2) {
    return crumbs;
  }

  const last = crumbs[crumbs.length - 1];
  const lastLink = asStringLink(last.routerLink);
  if (lastLink && normalizePath(lastLink) === path) {
    crumbs[crumbs.length - 1] = {
      id: last.id,
      label: last.label,
      icon: last.icon,
    };
  }

  return crumbs;
}
