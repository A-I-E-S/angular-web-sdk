import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter, map, startWith } from 'rxjs';

import {
  type AiesMenuItem,
  type AiesNavItem,
  type AiesNotification,
  type AiesSideNavItem,
  BreadcrumbComponent,
  SegmentComponent,
  SideNavComponent,
  TabDefDirective,
  TabsComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  NAV_APP_SHELL,
  NAV_BREADCRUMB,
  NAV_LOCAL_TABS,
  NAV_ROUTED_TABS,
  NAV_SEGMENT,
  NAV_SIDE,
} from '../snippets';
import { AppShellViewportPreviewComponent } from './viewport-preview.component';

/**
 *
 */
@Component({
  selector: 'app-navigation-page',
  standalone: true,
  imports: [
    AppShellViewportPreviewComponent,
    BreadcrumbComponent,
    TabsComponent,
    TabDefDirective,
    SegmentComponent,
    SideNavComponent,
    RouterOutlet,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Navigation"
        description="App chrome and in-page navigation: shell + side nav, breadcrumbs, tabs, and segments. When items set routerLink, the active state follows the URL so refresh and deep links stay in sync."
      />

      <app-demo-section
        title="App shell — mobile"
        hint="Phone layout (375px): hamburger opens the side nav as a drawer inside this frame; header stays compact without the clock."
        badge="new"
      >
        <app-shell-viewport-preview
          layout="mobile"
          [sideNav]="sideNav"
          [breadcrumbs]="shellBreadcrumbs"
          userName="Jane Doe"
          [userMenuItems]="userMenuItems"
          [notifications]="shellNotifications"
        />
      </app-demo-section>

      <app-demo-section
        title="App shell — tablet"
        hint="Tablet layout (768px): same in-frame drawer as mobile, with more room and date/time in the header."
        badge="new"
      >
        <app-shell-viewport-preview
          layout="tablet"
          [sideNav]="sideNav"
          [breadcrumbs]="shellBreadcrumbs"
          userName="Jane Doe"
          [userMenuItems]="userMenuItems"
          [notifications]="shellNotifications"
        />
      </app-demo-section>

      <app-demo-section
        title="App shell — desktop"
        hint="Desktop layout (1024px+): persistent side rail, full header chrome, centered content. Sample data only — wire your routes in the product app."
        badge="new"
        [code]="appShellCode"
      >
        <app-shell-viewport-preview
          layout="desktop"
          [sideNav]="sideNav"
          [breadcrumbs]="shellBreadcrumbs"
          userName="Jane Doe"
          [userMenuItems]="userMenuItems"
          [notifications]="shellNotifications"
        />
      </app-demo-section>

      <app-demo-section
        title="Side nav"
        hint="Primary product navigation. Collapse to icons; hover reveals labels and nested links. Collapse all appears above the list when a section is open. Set badge: true for a live-update dot."
        badge="new"
        [code]="sideNavCode"
      >
        <div
          class="flex h-[28rem] overflow-visible rounded-xl border border-border dark:border-white/10"
        >
          <aies-side-nav
            [items]="sideNav"
            [(collapsed)]="sideCollapsed"
            [(activeId)]="sideActiveId"
            ariaLabel="Demo portal"
          >
          </aies-side-nav>
          <div
            class="flex min-w-0 flex-1 flex-col justify-center gap-2 bg-background-welcome/60 p-6 dark:bg-ink-950/40"
          >
            <p class="m-0 text-caption uppercase tracking-wide text-neutral-500">
              Active
            </p>
            <p class="m-0 text-heading-3 text-ink dark:text-white">
              {{ sideActiveId() }}
            </p>
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{
                sideCollapsed()
                  ? 'Rail collapsed — hover an icon for the label blade.'
                  : 'Expanded — open Shipments for nested items.'
              }}
            </p>
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Breadcrumb"
        hint="Show where you are in the hierarchy and link back to parent pages. Crumbs follow the active child route here."
        [code]="breadcrumbCode"
      >
        <aies-breadcrumb [items]="crumbs()" />
      </app-demo-section>

      <app-demo-section
        title="Tabs (routed)"
        hint="Section tabs that change the URL (child routes). Active tab survives refresh and can be shared as a link."
        subtext="The page does not jump to the top when you switch tabs — navigation uses scroll: 'manual'. Pass [keepScroll]=&quot;false&quot; to use normal router scrolling."
        [code]="routedTabsCode"
      >
        <aies-tabs
          [items]="routeTabs"
          [(activeId)]="routeTabId"
          ariaLabel="Shipment sections"
        />
        <div class="mt-4">
          <router-outlet />
        </div>
      </app-demo-section>

      <app-demo-section
        title="Segment (routed via query)"
        hint="Compact pill switcher for view modes (density, status). Here it syncs to ?density= so the choice survives reload."
        subtext="Like routed tabs, switching keeps your scroll position instead of jumping to the top."
        [code]="segmentCode"
      >
        <aies-segment
          [items]="densitySegments"
          [(activeId)]="densityId"
          ariaLabel="List density"
        />
        <p class="mt-3 m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
          Active density from URL:
          <span class="font-medium text-ink dark:text-white">{{
            densityId() ?? '—'
          }}</span>
        </p>
      </app-demo-section>

      <app-demo-section
        title="Tabs (local)"
        hint="In-page panels with no router — bind [(activeId)] and render bodies with aiesTabDef."
        [code]="localTabsCode"
      >
        <aies-tabs
          [items]="localTabs"
          [(activeId)]="localTabId"
          ariaLabel="Local demo tabs"
        >
          <ng-template aiesTabDef="alpha">
            <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
              Local panel Alpha (not tied to the URL).
            </p>
          </ng-template>
          <ng-template aiesTabDef="beta">
            <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
              Local panel Beta (not tied to the URL).
            </p>
          </ng-template>
        </aies-tabs>
      </app-demo-section>
    </div>
  `,
})
export class NavigationPage {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly routeTabId = signal<string | null>(null);
  protected readonly densityId = signal<string | null>(null);
  protected readonly localTabId = signal('alpha');
  protected readonly sideCollapsed = signal(false);
  protected readonly sideActiveId = signal('track');

  protected readonly shellBreadcrumbs: AiesNavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'shipments', label: 'Shipments' },
    { id: 'track', label: 'STN-1042' },
  ];

  protected readonly userMenuItems: AiesMenuItem[] = [
    { label: 'Profile', icon: 'user', onClick: () => undefined },
    { label: 'Settings', icon: 'cog', onClick: () => undefined },
    {
      label: 'Sign out',
      icon: 'sign-out',
      danger: true,
      dividerBefore: true,
      onClick: () => undefined,
    },
  ];

  protected readonly shellNotifications: AiesNotification[] = [
    {
      id: 'n1',
      title: 'Shipment STN-1042 delivered',
      body: 'POD captured at Lagos hub.',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'n2',
      title: 'Warehouse sync complete',
      timestamp: new Date(Date.now() - 3_600_000).toISOString(),
      read: true,
    },
  ];

  protected readonly sideNav: AiesSideNavItem[] = [
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

  protected readonly routeTabs: AiesNavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'inbox',
      routerLink: '/components/navigation/overview',
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'file-add',
      routerLink: '/components/navigation/documents',
    },
    {
      id: 'events',
      label: 'Events',
      icon: 'alarm',
      routerLink: '/components/navigation/events',
    },
  ];

  protected readonly densitySegments: AiesNavItem[] = [
    {
      id: 'comfortable',
      label: 'Comfortable',
      routerLink: '/components/navigation/overview',
      queryParams: { density: 'comfortable' },
    },
    {
      id: 'compact',
      label: 'Compact',
      routerLink: '/components/navigation/overview',
      queryParams: { density: 'compact' },
    },
    {
      id: 'dense',
      label: 'Dense',
      routerLink: '/components/navigation/overview',
      queryParams: { density: 'dense' },
    },
  ];

  protected readonly localTabs: AiesNavItem[] = [
    { id: 'alpha', label: 'Alpha' },
    { id: 'beta', label: 'Beta' },
  ];

  protected readonly breadcrumbCode = NAV_BREADCRUMB;
  protected readonly routedTabsCode = NAV_ROUTED_TABS;
  protected readonly segmentCode = NAV_SEGMENT;
  protected readonly localTabsCode = NAV_LOCAL_TABS;
  protected readonly sideNavCode = NAV_SIDE;
  protected readonly appShellCode = NAV_APP_SHELL;

  /** Breadcrumb trail derived from the current URL (consumer pattern). */
  protected readonly crumbs = computed((): AiesNavItem[] => {
    const path = this.url().split('?')[0] ?? '';
    const leaf =
      path.includes('/documents')
        ? 'Documents'
        : path.includes('/events')
          ? 'Events'
          : 'Overview';
    return [
      { id: 'home', label: 'Home', routerLink: '/overview', icon: 'home' },
      {
        id: 'nav',
        label: 'Navigation',
        routerLink: '/components/navigation/overview',
      },
      { id: 'leaf', label: leaf },
    ];
  });
}
