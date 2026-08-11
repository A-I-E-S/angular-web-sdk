/**
 * Playground implementation snippets — table & pagination (@aies/aies-ui).
 * Each export is a copy-paste-ready guide for consumer apps.
 */

export /**
 *
 */
const TABLE_LIST = `
// =============================================================================
// INTENT
//   Production list screen: server-driven rows, sort, pagination, row actions.
//   Wrap fetch state in AsyncStateComponent; table stays presentational.
//
// PREREQUISITES
//   @aies/aies-ui (TableComponent, CellDefDirective, PaginationComponent,
//     AsyncStateComponent, ActionMenuComponent, types TableColumn, TableSortChange,
//     AiesMenuItem).
//   @aies/aies-models (AsyncQueryState, PaginationMeta, ApiResponseModel).
//   @aies/aies-core ApiClient.getResource for list fetches.
//
// DO
//   - Treat getResource() response.data as [rows] and response.pagination as [meta].
//   - Refetch on sortChange and pageChange — do not client-slice as primary paging.
//   - Use aiesCellDef templates for non-text cells (badges, actions, currency).
//   - Handle row actions via aies-action-menu — each item carries onClick.
//
// DON'T
//   - Put loading / error branches inside aies-table — use aies-async-state.
//   - Client-sort a full dataset when the API supports server-side order.
//
// PLAYGROUND NOTE
//   The playground table page uses in-memory ALL_ROWS + pageRows computed slice
//   to demo sort/pagination without a live API. Copy the wiring below for prod;
//   swap pageRows/meta/listState for getResource() results.
// =============================================================================

import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { AsyncQueryState, PaginationMeta } from '@aies/aies-models';
import {
  ActionMenuComponent,
  AsyncStateComponent,
  CellDefDirective,
  PaginationComponent,
  TableComponent,
  type AiesMenuItem,
  type TableColumn,
  type TableSortChange,
} from '@aies/aies-ui';
import { firstValueFrom } from 'rxjs';

interface Shipment {
  reference: string;
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  mode: 'sfn' | 'stn';
  destination: string;
  valueUsd: number;
}

const PAGE_SIZE = 20;

@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [
    AsyncStateComponent,
    TableComponent,
    CellDefDirective,
    PaginationComponent,
    ActionMenuComponent,
  ],
  template: \`
    <aies-async-state [state]="listState()" (retry)="refetch()">
      <aies-table
        [columns]="columns"
        [rows]="rows()"
        [sort]="sort()"
        (sortChange)="onSort($event)"
      >
        <ng-template aiesCellDef="status" let-row>
          <span class="inline-flex rounded-md px-2 py-0.5 text-caption font-medium">
            {{ row.status }}
          </span>
        </ng-template>

        <ng-template aiesCellDef="valueUsd" let-row>
          <span class="tabular-nums">{{ formatUsd(row.valueUsd) }}</span>
        </ng-template>

        <ng-template aiesCellDef="actions" let-row>
          <aies-action-menu
            [items]="rowActions(row)"
            [ariaLabel]="'Actions for ' + row.reference"
          />
        </ng-template>
      </aies-table>

      @if (meta(); as pager) {
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p class="m-0 text-caption text-neutral-600">
            Page {{ pager.currentPage }} / {{ pager.totalPages }}
            · {{ pager.totalItems }} total
          </p>
          <aies-pagination [meta]="pager" (pageChange)="onPageChange($event)" />
        </div>
      }
    </aies-async-state>
  \`,
})
export class ShipmentListPageComponent {
  private readonly api = inject(ApiClient);

  protected readonly page = signal(1);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly rows = signal<Shipment[]>([]);
  protected readonly meta = signal<PaginationMeta | null>(null);
  protected readonly fetchError = signal<string | null>(null);
  protected readonly isLoading = signal(false);

  protected readonly columns: TableColumn<Shipment>[] = [
    { key: 'reference', header: 'Reference', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'mode', header: 'Mode' },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'valueUsd', header: 'Value', sortable: true, width: '7rem' },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected rowActions(row: Shipment): AiesMenuItem[] {
    return [
      {
        label: 'Open',
        icon: 'eye',
        onClick: () => this.open(row),
      },
      {
        label: 'Edit',
        icon: 'edit',
        onClick: () => this.edit(row),
      },
      {
        label: 'Copy reference',
        icon: 'copy',
        onClick: () => this.copyReference(row),
      },
      {
        label: 'Delete',
        icon: 'trash',
        danger: true,
        dividerBefore: true,
        onClick: () => this.delete(row),
      },
    ];
  }

  protected readonly listState = computed((): AsyncQueryState<Shipment[]> => ({
    data: this.isLoading() ? undefined : this.rows(),
    isLoading: this.isLoading(),
    isFetching: this.isLoading(),
    isError: this.fetchError() != null,
    error: this.fetchError(),
  }));

  constructor() {
    this.refetch();
  }

  protected async refetch(): Promise<void> {
    this.isLoading.set(true);
    this.fetchError.set(null);
    try {
      const currentSort = this.sort();
      const res = await firstValueFrom(
        this.api.getResource<Shipment>('shipments', null, {
          page: this.page(),
          size: PAGE_SIZE,
          // Map sort key/direction to your API query params when supported.
          orderBy: currentSort?.key,
          order: currentSort?.direction,
        }),
      );
      this.rows.set(res.data ?? []);
      this.meta.set(res.pagination ?? null);
    } catch {
      this.fetchError.set('Could not load shipments.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onSort(change: TableSortChange): void {
    this.sort.set(change);
    this.page.set(1);
    this.refetch();
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
    this.refetch();
  }

  private open(row: Shipment): void {
    /* navigate to detail */
  }

  private edit(row: Shipment): void {
    /* open edit flow */
  }

  private copyReference(row: Shipment): void {
    /* clipboard.writeText(row.reference) */
  }

  private delete(row: Shipment): void {
    /* confirm + API delete */
  }

  protected formatUsd(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

// --- Playground-only demo (in-memory slice — NOT for production) ---
//
// const ALL_ROWS: Shipment[] = [/* static fixture */];
//
// pageRows = computed(() => {
//   const start = (this.page() - 1) * PAGE_SIZE;
//   return sortedRows().slice(start, start + PAGE_SIZE);
// });
//
// meta = computed((): PaginationMeta => ({ /* derived from ALL_ROWS.length */ }));
`;

export /**
 *
 */
const TABLE_COMPACT = `
// =============================================================================
// INTENT
//   Minimal read-only table — text columns only, no custom cell templates.
//   Columns without aiesCellDef fall back to String(row[key]).
//
// PREREQUISITES
//   @aies/aies-ui (TableComponent, type TableColumn).
//
// DO
//   - Use for simple pickers, previews, or secondary summaries.
//   - Keep column keys aligned with row object properties.
//
// DON'T
//   - Add AsyncState / pagination when the row set is small and static.
//   - Expect badges or menus without aiesCellDef templates.
// =============================================================================

import { Component } from '@angular/core';
import { TableComponent, type TableColumn } from '@aies/aies-ui';

interface Shipment {
  reference: string;
  destination: string;
  status: string;
}

@Component({
  selector: 'app-shipment-compact-preview',
  standalone: true,
  imports: [TableComponent],
  template: \`
    <aies-table [columns]="columns" [rows]="rows" />
  \`,
})
export class ShipmentCompactPreviewComponent {
  protected readonly columns: TableColumn<Shipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
  ];

  // Static preview rows — no aiesCellDef → each cell renders row[key] as plain text.
  protected readonly rows: Shipment[] = [
    { reference: 'SFN-1042', destination: 'Lagos', status: 'In transit' },
    { reference: 'STN-2088', destination: 'Accra', status: 'Delivered' },
    { reference: 'SFN-1099', destination: 'Nairobi', status: 'Pending' },
  ];
}
`;
