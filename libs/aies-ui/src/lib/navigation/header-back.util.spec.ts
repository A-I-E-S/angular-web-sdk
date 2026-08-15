import {
  buildBreadcrumbsFromSideNav,
  isCatalogRootRoute,
  isNestedChildRoute,
  resolveCatalogRootLink,
  resolveContentBackTarget,
  resolveHeaderBackTarget,
  resolveParentPathFromLevels,
} from './header-back.util';
import type { AiesSideNavItem } from './side-nav';

const navItems: AiesSideNavItem[] = [
  { id: 'overview', label: 'Overview', routerLink: '/overview' },
  {
    id: 'components',
    label: 'Components',
    children: [
      { id: 'button', label: 'Button', routerLink: '/components/button' },
      {
        id: 'navigation',
        label: 'Navigation',
        routerLink: '/components/navigation/overview',
      },
    ],
  },
  {
    id: 'foundation',
    label: 'Foundation',
    children: [{ id: 'icons', label: 'Icons', routerLink: '/icons' }],
  },
];

describe('resolveParentPathFromLevels', () => {
  it('returns the Angular parent for a pasted nested child URL', () => {
    expect(
      resolveParentPathFromLevels([
        [],
        ['components', 'navigation'],
        ['documents'],
      ]),
    ).toBe('/components/navigation');
  });

  it('returns null when the leaf has no parent route', () => {
    expect(
      resolveParentPathFromLevels([[], ['components', 'button']]),
    ).toBeNull();
    expect(resolveParentPathFromLevels([[], ['overview']])).toBeNull();
    expect(resolveParentPathFromLevels([[]])).toBeNull();
  });
});

describe('resolveContentBackTarget', () => {
  it('uses the route parent, preferring the catalog overview link', () => {
    expect(
      resolveContentBackTarget(
        '/components/navigation',
        '/components/navigation/documents',
        '/components/navigation/overview',
      ),
    ).toEqual({
      routerLink: '/components/navigation/overview',
    });
  });

  it('falls back to the Angular parent when catalog has no overview link', () => {
    expect(
      resolveContentBackTarget(
        '/components/navigation',
        '/components/navigation/documents',
        null,
      ),
    ).toEqual({
      routerLink: '/components/navigation',
    });
  });

  it('hides Back on the parent/overview itself', () => {
    expect(
      resolveContentBackTarget(
        '/components/navigation',
        '/components/navigation/overview',
        '/components/navigation/overview',
      ),
    ).toBeNull();
  });

  it('hides Back when there is no parent route', () => {
    expect(
      resolveContentBackTarget(null, '/components/button', '/components/button'),
    ).toBeNull();
  });

  it('forwards list query params so Back restores filters and page', () => {
    expect(
      resolveContentBackTarget(
        '/usecases/shipment',
        '/usecases/shipment/STN-1042?page=2&size=15&search=STN',
        '/usecases/shipment',
      ),
    ).toEqual({
      routerLink: '/usecases/shipment',
      queryParams: { page: '2', size: '15', search: 'STN' },
    });
  });
});

describe('route classification', () => {
  it('detects nested child routes', () => {
    expect(isNestedChildRoute('/components/navigation/documents', navItems)).toBe(
      true,
    );
    expect(isNestedChildRoute('/components/navigation/overview', navItems)).toBe(
      false,
    );
  });

  it('detects catalog root routes', () => {
    expect(isCatalogRootRoute('/components/button', navItems)).toBe(true);
    expect(isCatalogRootRoute('/components/navigation/documents', navItems)).toBe(
      false,
    );
  });

  it('resolves catalog root links', () => {
    expect(
      resolveCatalogRootLink('/components/navigation/events', navItems),
    ).toBe('/components/navigation/overview');
  });
});

describe('resolveHeaderBackTarget', () => {
  it('returns the penultimate breadcrumb routerLink', () => {
    expect(
      resolveHeaderBackTarget([
        { id: 'home', label: 'Home', routerLink: '/' },
        { id: 'nav', label: 'Navigation', routerLink: '/components/navigation/overview' },
        { id: 'leaf', label: 'Documents' },
      ]),
    ).toEqual({
      routerLink: '/components/navigation/overview',
    });
  });

  it('returns null on shallow routes', () => {
    expect(
      resolveHeaderBackTarget([{ id: 'home', label: 'Home', routerLink: '/overview' }]),
    ).toBeNull();
  });
});

describe('buildBreadcrumbsFromSideNav', () => {
  it('builds crumbs for overview', () => {
    expect(buildBreadcrumbsFromSideNav('/overview', navItems)).toEqual([
      { id: 'home', label: 'Home', routerLink: '/overview', icon: 'home' },
      { id: 'overview', label: 'Overview' },
    ]);
  });

  it('builds crumbs for a nested child route', () => {
    expect(
      buildBreadcrumbsFromSideNav('/components/navigation/documents', navItems),
    ).toEqual([
      { id: 'home', label: 'Home', routerLink: '/overview', icon: 'home' },
      { id: 'components', label: 'Components' },
      {
        id: 'navigation',
        label: 'Navigation',
        routerLink: '/components/navigation/overview',
      },
      { id: 'segment-documents', label: 'Documents' },
    ]);
  });

  it('builds crumbs for a top-level catalog page', () => {
    expect(buildBreadcrumbsFromSideNav('/components/button', navItems)).toEqual([
      { id: 'home', label: 'Home', routerLink: '/overview', icon: 'home' },
      { id: 'components', label: 'Components' },
      { id: 'button', label: 'Button' },
    ]);
  });
});
