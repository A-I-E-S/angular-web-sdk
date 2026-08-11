// Playground snippet modules — copy-paste implementation guides for feedback states.

export const FEEDBACK_LOADING = `// Intent
// Show blocking (block) vs compact (inline) loading indicators for async surfaces.
// Spinner accent follows ModeColorService (SFN green / STN orange).
//
// Prerequisites
// - LoadingStateComponent from @aies/aies-ui.
//
// Do
// - Use mode="block" (default) for page/panel first-load placeholders.
// - Use mode="inline" inside toolbars, table headers, or nested slots during refresh.
// - Provide a short message ("Loading shipments…") for screen readers (aria-live polite).
//
// Don't
// - Put LoadingState inside aies-table — wrap the whole table region in AsyncState instead.
// - Use inline mode for initial page load — block gives correct vertical rhythm.
// - Stack multiple spinners — one loading surface per logical fetch.

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
export class LoadingDemoComponent {}`;

export const FEEDBACK_ERROR = `// Intent
// Blocking error state for failed fetches — always includes a Retry control.
//
// Prerequisites
// - ErrorStateComponent from @aies/aies-ui.
// - A (retry) handler wired to refetch() / reload() — omitting it is a misuse.
//
// Do
// - Pass a concrete message from the API layer (error?.message ?? fallback).
// - Route (retry) to the same refetch entry point your query layer exposes.
// - Use for section/page-level fetch failures — not field validation errors.
//
// Don't
// - Hide or omit the retry button — the component always renders it by design.
// - Use ErrorState for 404 on a single row — that belongs in row UI or toast.
// - Nest ErrorState inside Table — wrap with AsyncState at the list boundary.

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
}`;

export const FEEDBACK_EMPTY = `// Intent
// Blocking empty state when fetch succeeded but produced no rows / value.
// Retry is always visible — often wired to resetFilters() or refetch().
//
// Prerequisites
// - EmptyStateComponent from @aies/aies-ui.
//
// Do
// - Override message for filter-specific copy ("No shipments match your filters.").
// - Wire (retry) to resetFilters(), clear search, or refetch — same as AsyncState empty branch.
// - Prefer AsyncState for list pages — it chooses EmptyState when data is [] after load.
//
// Don't
// - Use EmptyState while isLoading is true — user should see LoadingState first.
// - Omit (retry) — empty often changes after filter reset; the button must do something.
// - Show EmptyState inside table body — AsyncState replaces the whole content region.

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
}`;

export const FEEDBACK_ASYNC = `// Intent
// Wrap list/detail content in AsyncState — maps AsyncQueryState<T> to loading / error /
// empty / success with non-blocking badges for background refetch and stale errors.
//
// Prerequisites
// - AsyncStateComponent from @aies/aies-ui.
// - AsyncQueryState<T> from @aies/aies-models (mirrors TanStack Query signals).
// - In production: computed() that maps injectQuery() into AsyncQueryState shape.
//
// Do
// - Wrap aies-table (and pagination) in aies-async-state — table stays presentational.
// - Wire one (retry) handler → query.refetch() for error, empty, and stale badge paths.
// - Map all five flags: data, isLoading, isFetching, isError, error.
//
// Don't
// - Branch on isLoading inside TableComponent or row templates.
// - Block UI on isFetching when data exists — AsyncState shows "Updating…" badge instead.
// - Use LoadingState as a table row — violates separation; AsyncState owns blocking states.

import { Component, computed, inject, signal } from '@angular/core';
import type { AsyncQueryState } from '@aies/aies-models';
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
      <aies-table [columns]="columns" [rows]="state().data ?? []" />
    </aies-async-state>
  \`,
})
export class ShipmentListComponent {
  // Playground: manual signal. Production: computed from injectQuery().
  private readonly queryData = signal<Shipment[] | undefined>(undefined);
  private readonly queryLoading = signal(true);
  private readonly queryFetching = signal(false);
  private readonly queryError = signal<string | null>(null);

  protected readonly state = computed((): AsyncQueryState<Shipment[]> => ({
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
// readonly state = computed<AsyncQueryState<Shipment[]>>(() => ({
//   data: this.query.data(),
//   isLoading: this.query.isLoading(),
//   isFetching: this.query.isFetching(),
//   isError: this.query.isError(),
//   error: this.query.error()?.message ?? null,
// }));`;
