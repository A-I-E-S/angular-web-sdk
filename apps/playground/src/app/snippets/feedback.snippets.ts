/**
 * Playground snippets — feedback states.
 */

export /**
 *
 */
const FEEDBACK_LOADING = `
// Block for first load; inline for a quiet refresh in a toolbar or header.
// Spinner color follows ModeColorService. Don’t drop this inside aies-table — use AsyncState.

import { Component } from '@angular/core';
import { LoadingStateComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-loading-demo',
  standalone: true,
  imports: [LoadingStateComponent],
  template: \`
    <div class="grid gap-6 md:grid-cols-2">
      <div class="flex flex-col gap-2">
        <p class="m-0 text-caption font-medium text-neutral-600">Block</p>
        <div
          class="flex min-h-[10rem] items-center justify-center rounded-lg border border-dashed border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
        >
          <aies-loading-state message="Loading shipments…" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="m-0 text-caption font-medium text-neutral-600">Inline</p>
        <div
          class="flex min-h-[10rem] items-center rounded-lg border border-dashed border-border bg-background-welcome px-5 dark:border-white/10 dark:bg-ink-950"
        >
          <aies-loading-state mode="inline" message="Refreshing rates…" />
        </div>
      </div>
    </div>
  \`,
})
export class LoadingDemoComponent {}
`;

export /**
 *
 */
const FEEDBACK_ERROR = `
// Fetch failed — always wire (retry) to your refetch. Message from the API layer is fine.
// Section/page failures only; not field validation or a single missing row.

import { Component, inject, signal } from '@angular/core';
import { ErrorStateComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-error-demo',
  standalone: true,
  imports: [ErrorStateComponent],
  template: \`
    <div
      class="rounded-lg border border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
    >
      <aies-error-state
        [message]="errorMessage()"
        (retry)="refetch()"
      />
    </div>
  \`,
})
export class ErrorDemoComponent {
  // In production: map injectQuery() / getResource() error signal to this string.
  protected readonly errorMessage = signal(
    'Failed to load shipments. Check your connection and try again.',
  );

  protected refetch(): void {
    // query.refetch() or resource.reload() — same handler AsyncState uses via (retry).
  }
}
`;

export /**
 *
 */
const FEEDBACK_EMPTY = `
// Load succeeded but nothing matched. Retry often means resetFilters() or refetch.
// Prefer AsyncState on list pages — it picks EmptyState when data is [].

import { Component, signal } from '@angular/core';
import { EmptyStateComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-empty-demo',
  standalone: true,
  imports: [EmptyStateComponent],
  template: \`
    <aies-empty-state
      [message]="message()"
      (retry)="resetFilters()"
    />
  \`,
})
export class EmptyDemoComponent {
  protected readonly message = signal('No shipments match your filters.');

  protected resetFilters(): void {
    // Clear facet signals → triggers list refetch with default params.
  }
}
`;

export /**
 *
 */
const FEEDBACK_ERROR_INDICATOR = `
// Non-blocking top-right pill — stale data stays visible underneath.
// AsyncState uses this automatically when data exists but refresh failed.

import { Component, signal } from '@angular/core';
import { ErrorIndicatorComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-stale-data-panel',
  standalone: true,
  imports: [ErrorIndicatorComponent],
  template: \`
    <div class="relative min-h-[12rem] rounded-xl border border-border p-4 dark:border-white/10">
      <aies-error-indicator
        class="absolute top-3 right-3 z-10 max-w-[min(100%-1.5rem,20rem)]"
        error="Failed to fetch the most recent data."
        retryText="Refresh"
        [refreshing]="isRefreshing()"
        [refreshingText]="isRefreshing() ? 'Refreshing...' : 'Refresh'"
        (retry)="refetch()"
      />

      <!-- Existing table / cards stay mounted -->
      <ng-content />
    </div>
  \`,
})
export class StaleDataPanelComponent {
  protected readonly isRefreshing = signal(false);

  protected refetch(): void {
    this.isRefreshing.set(true);
    // query.refetch().finally(() => this.isRefreshing.set(false));
  }
}

// Standalone call sites:
// Socket: error="Connection lost" retryText="Reconnect" refreshingText="Connecting..."
// Currencies: error="Error fetching currencies" (retryText defaults to "Retry")
`;

export /**
 *
 */
const FEEDBACK_ASYNC = `
// Wrap the list (table + pagination). Maps loading / error / empty / success for you.
// Background refetch keeps content on screen. Wire your own in-flight cue (e.g. table Refresh). One (retry) → refetch.

import { Component, computed, inject, signal } from '@angular/core';
import type { AsyncQueryStateModel } from '@aies/aies-models';
import {
  AsyncStateComponent,
  TableComponent,
  type TableColumn,
} from '@aies/aies-ui';

interface Shipment {
  id: string;
  route: string;
  status: string;
}

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [AsyncStateComponent, TableComponent],
  template: \`
    <aies-async-state [state]="state()" (retry)="refetch()">
      <aies-table
        [columns]="columns"
        [rows]="state().data ?? []"
        [refreshing]="state().isFetching"
      />
    </aies-async-state>
  \`,
})
export class ShipmentListComponent {
  // Playground: manual signal. Production: computed from injectQuery().
  private readonly queryData = signal<Shipment[] | undefined>(undefined);
  private readonly queryLoading = signal(true);
  private readonly queryFetching = signal(false);
  private readonly queryError = signal<string | null>(null);

  protected readonly state = computed((): AsyncQueryStateModel<Shipment[]> => ({
    data: this.queryData(),
    isLoading: this.queryLoading(),
    isFetching: this.queryFetching(),
    isError: this.queryError() !== null,
    error: this.queryError(),
  }));

  protected readonly columns: TableColumn<Shipment>[] = [
    { key: 'id', header: 'Reference', sortable: true },
    { key: 'route', header: 'Route' },
    { key: 'status', header: 'Status', sortable: true },
  ];

  protected refetch(): void {
    // Production one-liner: this.shipmentsQuery.refetch();
    this.queryLoading.set(this.queryData() === undefined);
    this.queryFetching.set(true);
    this.queryError.set(null);
    // … HTTP GET → on success set queryData + clear flags; on error set queryError.
  }
}

// Production mapping (TanStack Query) — drop into the same component:
//
// readonly query = injectQuery(() => ({
//   queryKey: ['shipments', this.filters()],
//   queryFn: () => this.api.getShipments(this.filters()),
// }));
//
// readonly state = computed<AsyncQueryStateModel<Shipment[]>>(() => ({
//   data: this.query.data(),
//   isLoading: this.query.isLoading(),
//   isFetching: this.query.isFetching(),
//   isError: this.query.isError(),
//   error: this.query.error()?.message ?? null,
// }));
`;
