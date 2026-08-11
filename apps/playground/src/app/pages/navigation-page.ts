import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {
  BreadcrumbComponent,
  SegmentComponent,
  TabDefDirective,
  TabsComponent,
  type AiesNavItem,
} from '@aies/aies-ui';
import { filter, map, startWith } from 'rxjs';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';

@Component({
  selector: 'app-navigation-page',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    TabsComponent,
    TabDefDirective,
    SegmentComponent,
    RouterOutlet,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Navigation"
        description="Tabs and segment follow the browser URL via the consumer’s Router — cold-load /components/navigation/documents and Documents is selected."
      />

      <app-demo-section
        title="Breadcrumb"
        hint="Crumbs reflect the active child route (built from the Router URL)."
        [code]="breadcrumbCode"
      >
        <aies-breadcrumb [items]="crumbs()" />
      </app-demo-section>

      <app-demo-section
        title="Tabs (routed)"
        hint="Child routes under /components/navigation/*. Active tab = Router.isActive (works on refresh)."
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
        hint="Same path, different ?density=… — selected pill matches the query on load."
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
        hint="No routerLink — selection is only [(activeId)] + aiesTabDef panels."
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

  protected readonly breadcrumbCode = `import { BreadcrumbComponent, type AiesNavItem } from '@aies/aies-ui';

items: AiesNavItem[] = [
  { id: 'home', label: 'Home', routerLink: '/' },
  { id: 'shipments', label: 'Shipments', routerLink: '/shipments' },
  { id: 'current', label: 'SFN-1042' }, // last = current page
];

<aies-breadcrumb [items]="items" />`;

  protected readonly routedTabsCode = `items = [
  { id: 'overview', label: 'Overview', routerLink: '/shipments/1/overview' },
  { id: 'docs', label: 'Documents', routerLink: '/shipments/1/docs' },
];

<aies-tabs [items]="items" [(activeId)]="activeId" ariaLabel="Shipment" />
<router-outlet />`;

  protected readonly segmentCode = `items = [
  { id: 'list', label: 'List', routerLink: '/shipments', queryParams: { view: 'list' } },
  { id: 'map', label: 'Map', routerLink: '/shipments', queryParams: { view: 'map' } },
];

<aies-segment [items]="items" [(activeId)]="viewId" ariaLabel="View" />`;

  protected readonly localTabsCode = `<aies-tabs [items]="localTabs" [(activeId)]="localTabId">
  <ng-template aiesTabDef="alpha">Panel Alpha</ng-template>
  <ng-template aiesTabDef="beta">Panel Beta</ng-template>
</aies-tabs>`;

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
      { id: 'home', label: 'Home', routerLink: '/', icon: 'home' },
      {
        id: 'nav',
        label: 'Navigation',
        routerLink: '/components/navigation/overview',
      },
      { id: 'leaf', label: leaf },
    ];
  });
}
