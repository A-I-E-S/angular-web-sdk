/**
 * Playground implementation snippets — navigation (@aies/aies-ui).
 * Each export is a copy-paste-ready guide for consumer apps.
 */

export const NAV_BREADCRUMB = `
// =============================================================================
// INTENT
//   Hierarchical trail for wayfinding. The consumer builds and owns the items
//   array — breadcrumb does not walk the route tree automatically.
//
// PREREQUISITES
//   @aies/aies-ui (BreadcrumbComponent, type AiesNavItem).
//   Optional: computed() that maps Router URL / feature state into crumbs.
//
// DO
//   - Set routerLink on every ancestor crumb; omit on the last (current page).
//   - Keep ids stable for track-by and tests.
//   - Rebuild crumbs when context changes (record id, tab, filters).
//
// DON'T
//   - Expect automatic crumbs from ActivatedRoute — you supply [items].
//   - Make the last crumb clickable — the component marks it aria-current="page".
// =============================================================================

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

  // Mirror URL for reactive crumb labels — consumer-owned mapping logic.
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
      { id: 'home', label: 'Home', routerLink: '/', icon: 'home' },
      { id: 'shipments', label: 'Shipments', routerLink: '/shipments' },
      { id: 'detail', label: ref, routerLink: '/shipments/' + ref + '/overview' },
      { id: 'section', label: section }, // current page — no routerLink
    ];
  });
}
`;

export const NAV_ROUTED_TABS = `
// =============================================================================
// INTENT
//   URL-driven section tabs paired with child routes and router-outlet.
//   Active tab follows Router.isActive — cold-load / refresh keeps selection.
//
// PREREQUISITES
//   @aies/aies-ui (TabsComponent, type AiesNavItem).
//   Child routes configured under the parent path (overview, documents, events).
//   RouterOutlet in the same template below the tab list.
//
// DO
//   - Put routerLink on each AiesNavItem; bind [(activeId)] for two-way sync.
//   - Render <router-outlet /> for routed panel content.
//   - Set ariaLabel on the tablist for screen readers.
//
// DON'T
//   - Mix routed tabs with aiesTabDef panels — use routed OR local, not both.
//   - Hard-code active tab in ngOnInit — the tabs component reads the Router.
// =============================================================================

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
  // Optional mirror of active id — tabs derive highlight from Router when routerLink is set.
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

export const NAV_SEGMENT = `
// =============================================================================
// INTENT
//   Compact pill switcher on a fixed path using queryParams for view state.
//   Same URL path, different ?density=… — active pill matches query on load.
//
// PREREQUISITES
//   @aies/aies-ui (SegmentComponent, type AiesNavItem).
//   Parent route reads query params for list density / view mode.
//
// DO
//   - Repeat routerLink path on each item; vary queryParams per segment.
//   - Bind [(activeId)]; segment syncs from Router.isActive including cold load.
//   - Read the query param in the page to apply layout (comfortable / compact / dense).
//
// DON'T
//   - Use segment for unrelated paths — use tabs with distinct routerLink paths.
//   - Forget queryParams on every item — otherwise pills cannot distinguish state.
// =============================================================================

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

  // Optional: read ?density= directly for layout logic.
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

export const NAV_LOCAL_TABS = `
// =============================================================================
// INTENT
//   In-page tabs with no router involvement — selection is [(activeId)] only.
//   Panel bodies come from projected ng-template aiesTabDef="id" blocks.
//
// PREREQUISITES
//   @aies/aies-ui (TabsComponent, TabDefDirective, type AiesNavItem).
//
// DO
//   - Omit routerLink on items for local mode.
//   - Match aiesTabDef template ids to AiesNavItem.id values.
//   - Bind [(activeId)] to a signal or property with a sensible default.
//
// DON'T
//   - Add router-outlet — content lives inside aiesTabDef templates.
//   - Expect URL to reflect tab changes — bookmarking requires routed tabs instead.
// =============================================================================

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
