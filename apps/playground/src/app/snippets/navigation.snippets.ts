// Navigation copy-paste examples.

export /**
 *
 */
const NAV_BREADCRUMB = `// You own the items array — breadcrumb won't walk the route tree for you.
// Link every ancestor; leave routerLink off the last crumb (current page).

import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { BreadcrumbComponent, type AiesNavItem } from '@aies/aies-ui';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-shipment-detail-chrome',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: \`
    <aies-breadcrumb [items]="crumbs()" />
  \`,
})
export class ShipmentDetailChromeComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly shipmentRef = signal('SFN-1042');

  protected readonly crumbs = computed((): AiesNavItem[] => {
    const ref = this.shipmentRef();
    const path = this.url().split('?')[0] ?? '';
    const section = path.includes('/documents')
      ? 'Documents'
      : path.includes('/events')
        ? 'Events'
        : 'Overview';

    return [
      { id: 'home', label: 'Home', routerLink: '/overview', icon: 'home' },
      { id: 'shipments', label: 'Shipments', routerLink: '/shipments' },
      { id: 'detail', label: ref, routerLink: '/shipments/' + ref + '/overview' },
      { id: 'section', label: section }, // current page — no routerLink
    ];
  });
}
`;

export /**
 *
 */
const NAV_ROUTED_TABS = `// URL-driven tabs + child routes. Active tab follows Router.isActive (survives refresh).
// Put routerLink on each item, render <router-outlet /> below. Don't mix with aiesTabDef.
// keepScroll defaults to true — navigates with { scroll: 'manual' } so the page does not jump to the top.
// Pass [keepScroll]="false" if you want the app's normal scrollPositionRestoration behaviour.

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabsComponent, type AiesNavItem } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-detail-tabs',
  standalone: true,
  imports: [TabsComponent, RouterOutlet],
  template: \`
    <aies-tabs
      [items]="routeTabs"
      [(activeId)]="routeTabId"
      ariaLabel="Shipment sections"
    />

    <div class="mt-4">
      <router-outlet />
    </div>
  \`,
})
export class ShipmentDetailTabsComponent {
  protected readonly routeTabId = signal<string | null>(null);

  protected readonly routeTabs: AiesNavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'inbox',
      routerLink: '/shipments/SFN-1042/overview',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'file-add',
      routerLink: '/shipments/SFN-1042/documents',
    },
    {
      id: 'events',
      label: 'Events',
      icon: 'alarm',
      routerLink: '/shipments/SFN-1042/events',
    },
  ];
}

// Example child route config (app.routes.ts excerpt):
//
// {
//   path: 'shipments/:ref',
//   component: ShipmentDetailTabsComponent,
//   children: [
//     { path: 'overview', loadComponent: () => import('./overview').then(m => m.OverviewPage) },
//     { path: 'documents', loadComponent: () => import('./documents').then(m => m.DocumentsPage) },
//     { path: 'events', loadComponent: () => import('./events').then(m => m.EventsPage) },
//     { path: '', pathMatch: 'full', redirectTo: 'overview' },
//   ],
// }
`;

export /**
 *
 */
const NAV_SEGMENT = `// Pill switcher on one path — same routerLink, different queryParams per segment.
// Active pill matches the query on cold load.
// keepScroll defaults to true — no jump to top when the query changes (same as routed tabs).

import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SegmentComponent, type AiesNavItem } from '@aies/aies-ui';
import { map } from 'rxjs';

@Component({
  selector: 'app-shipment-list-density',
  standalone: true,
  imports: [SegmentComponent],
  template: \`
    <aies-segment
      [items]="densitySegments"
      [(activeId)]="densityId"
      ariaLabel="List density"
    />

    <p class="mt-3 text-body-sm">
      Active density from URL:
      <span class="font-medium">{{ densityId() ?? '—' }}</span>
    </p>
  \`,
})
export class ShipmentListDensityComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly densityFromUrl = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('density') ?? 'comfortable')),
    { initialValue: 'comfortable' },
  );

  protected readonly densityId = signal<string | null>(null);

  protected readonly densitySegments: AiesNavItem[] = [
    {
      id: 'comfortable',
      label: 'Comfortable',
      routerLink: '/shipments',
      queryParams: { density: 'comfortable' },
    },
    {
      id: 'compact',
      label: 'Compact',
      routerLink: '/shipments',
      queryParams: { density: 'compact' },
    },
    {
      id: 'dense',
      label: 'Dense',
      routerLink: '/shipments',
      queryParams: { density: 'dense' },
    },
  ];
}
`;

export /**
 *
 */
const NAV_LOCAL_TABS = `// In-page tabs — no router. Selection is [(activeId)] only; panels live in aiesTabDef.
// Match template ids to AiesNavItem.id. Want bookmarkable tabs? Use routed tabs instead.

import { Component, signal } from '@angular/core';
import { TabDefDirective, TabsComponent, type AiesNavItem } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-editor-local-tabs',
  standalone: true,
  imports: [TabsComponent, TabDefDirective],
  template: \`
    <aies-tabs
      [items]="localTabs"
      [(activeId)]="localTabId"
      ariaLabel="Editor sections"
    >
      <ng-template aiesTabDef="general">
        <p class="m-0 text-body">General fields — not tied to the URL.</p>
      </ng-template>

      <ng-template aiesTabDef="parties">
        <p class="m-0 text-body">Shipper and consignee — local panel only.</p>
      </ng-template>

      <ng-template aiesTabDef="charges">
        <p class="m-0 text-body">Charges and duties — local panel only.</p>
      </ng-template>
    </aies-tabs>
  \`,
})
export class ShipmentEditorLocalTabsComponent {
  protected readonly localTabId = signal('general');

  protected readonly localTabs: AiesNavItem[] = [
    { id: 'general', label: 'General', icon: 'edit' },
    { id: 'parties', label: 'Parties', icon: 'user' },
    { id: 'charges', label: 'Charges', icon: 'wallet' },
  ];
}
`;

export /**
 *
 */
const NAV_SIDE = `// Ink-spine side nav — icons, nested children, collapse to icon rail.
// Soft active highlight; collapsed: hover an icon for a label blade.
// Collapse all sits above the list (top right) when any section is open.

import { Component, signal } from '@angular/core';
import {
  SideNavComponent,
  type AiesSideNavItem,
} from '@aies/aies-ui';

@Component({
  selector: 'app-shell-nav',
  standalone: true,
  imports: [SideNavComponent],
  template: \`
    <div class="h-[28rem] overflow-visible rounded-xl border border-border dark:border-white/10">
      <aies-side-nav
        [items]="nav"
        [(collapsed)]="collapsed"
        [(activeId)]="activeId"
        ariaLabel="Portal"
      >
      </aies-side-nav>
    </div>
  \`,
})
export class ShellNavComponent {
  protected readonly collapsed = signal(false);
  protected readonly activeId = signal('shipments');

  protected readonly nav: AiesSideNavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    {
      id: 'shipments',
      label: 'Shipments',
      icon: 'truck',
      badge: true,
      children: [
        { id: 'track', label: 'Track', icon: 'map-marker', badge: true },
        { id: 'create', label: 'Create', icon: 'plus' },
      ],
    },
    { id: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
    { id: 'settings', label: 'Settings', icon: 'cog' },
  ];
}
`;

export /**
 *
 */
const NAV_APP_SHELL = `// Dedicated app shell — breadcrumbs + Back in the content column;
// header holds clock, notifications, and avatar.
// Needs provideAiesUiOverlays() for the notification drawer.
// Back is built into aies-app-shell — nest child routes under a parent and it appears.
// Log out: confirm → UserService.logoutFromAllSessions() → AuthTokenService.clear().

import { Component, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { AuthTokenService, UserService } from '@aies/aies-core';
import {
  AppShellComponent,
  ConfirmService,
  SideNavComponent,
  type AiesMenuItem,
  type AiesNavItem,
  type AiesNotification,
  type AiesSideNavItem,
} from '@aies/aies-ui';

@Component({
  selector: 'app-product-shell',
  standalone: true,
  imports: [AppShellComponent, SideNavComponent],
  template: \`
    <aies-app-shell
      contentWidth="5xl"
      [headerTitle]="pageTitle"
      [breadcrumbs]="crumbs"
      [catalogNav]="nav"
      userName="Jane Doe"
      [userMenuItems]="accountMenu"
      [notifications]="notifications"
    >
      <aies-side-nav
        sidenav
        [items]="nav"
        [(collapsed)]="collapsed"
        [(activeId)]="activeId"
      >
      </aies-side-nav>

      <router-outlet />
    </aies-app-shell>
  \`,
})
export class ProductShellComponent {
  private readonly confirm = inject(ConfirmService);
  private readonly users = inject(UserService);
  private readonly auth = inject(AuthTokenService);

  protected readonly collapsed = signal(false);
  protected readonly activeId = signal('home');
  protected readonly pageTitle = 'STN-1042';

  protected readonly crumbs: AiesNavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'shipments', label: 'Shipments' },
    { id: 'track', label: 'STN-1042' },
  ];

  protected readonly accountMenu: AiesMenuItem[] = [
    { label: 'Profile', icon: 'user', onClick: () => {} },
    { label: 'Settings', icon: 'cog', onClick: () => {} },
    {
      label: 'Log out',
      icon: 'sign-out',
      danger: true,
      dividerBefore: true,
      onClick: () => this.confirmLogout(),
    },
  ];

  protected readonly notifications: AiesNotification[] = [
    {
      id: 'n1',
      title: 'Shipment delivered',
      timestamp: new Date().toISOString(),
    },
  ];

  protected readonly nav: AiesSideNavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'shipments', label: 'Shipments', icon: 'truck' },
  ];

  protected confirmLogout(): void {
    this.confirm
      .confirm({
        title: 'Log out?',
        message:
          'This signs you out of this device and every other session.',
        confirmLabel: 'Log out',
        danger: true,
      })
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.users
          .logoutFromAllSessions()
          .pipe(finalize(() => this.auth.clear()))
          .subscribe();
      });
  }
}
`;
