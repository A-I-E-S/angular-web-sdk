import { Component, input } from '@angular/core';

/** Routed tab panel body for the navigation playground demo. */
@Component({
  selector: 'app-nav-route-panel',
  standalone: true,
  template: `
    <div
      class="rounded-lg border border-border bg-background-welcome px-4 py-3 dark:border-white/10 dark:bg-ink-950"
    >
      <p class="m-0 text-body font-medium text-ink dark:text-white">
        {{ title() }}
      </p>
      <p class="mt-1 m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
        {{ body() }}
      </p>
      <p class="mt-2 m-0 text-caption text-neutral-500">
        Loaded from the URL — refresh or paste this path to land on this tab.
      </p>
    </div>
  `,
})
export class NavRoutePanelComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
}

@Component({
  selector: 'app-nav-overview-panel',
  standalone: true,
  imports: [NavRoutePanelComponent],
  template: `
    <app-nav-route-panel
      title="Overview"
      body="Route-driven overview panel for the active shipment."
    />
  `,
})
export class NavOverviewPanel {}

@Component({
  selector: 'app-nav-documents-panel',
  standalone: true,
  imports: [NavRoutePanelComponent],
  template: `
    <app-nav-route-panel
      title="Documents"
      body="Airway bills, invoices, and packing lists for this shipment."
    />
  `,
})
export class NavDocumentsPanel {}

@Component({
  selector: 'app-nav-events-panel',
  standalone: true,
  imports: [NavRoutePanelComponent],
  template: `
    <app-nav-route-panel
      title="Events"
      body="Scan history and exception notes for this shipment."
    />
  `,
})
export class NavEventsPanel {}
