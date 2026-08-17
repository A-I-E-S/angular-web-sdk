// Table & pagination copy-paste examples.

export /**
 *
 */
const TABLE_LIST = `// Server-driven list: keep the table mounted; loading / empty / error render in the body.
// Toolbar: Refresh (left); Filters + Export (right). Pass [meta] for the built-in pager.
// Hydrate page/size/filters from FilterQueryService when the URL has those queries.
// Pager + Apply write the same keys back. Refetch on sortChange / pageChange / sizeChange.
// Refresh → [refreshing] (rows stay, button spins). Page/size / first load → [loading]
// (pager spinner when rows exist; body spinner on first load).
// Empty and hard errors stay in-grid so Filters / Export / pager remain available.
// Expandable rows: aiesRowDetail="Label" let-row for label / component value pairs.
// Column width: omit to size to content; set width (e.g. '3.5rem') to pin actions.
// The actions column sticks to the right while the table scrolls horizontally.

import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient, downloadCsv } from '@aies/aies-core';
import type { AsyncQueryStateModel, PaginationMetaModel } from '@aies/aies-models';
import {
  ActionMenuComponent,
  CellDefDirective,
  ChipComponent,
  CopyButtonComponent,
  DEFAULT_PAGE_SIZE,
  FilterQueryService,
  RowDetailDefDirective,
  TableComponent,
  trackShipmentsFilterConfig,
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

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [
    TableComponent,
    CellDefDirective,
    RowDetailDefDirective,
    ActionMenuComponent,
    ChipComponent,
    CopyButtonComponent,
  ],
  template: \`
    <aies-table
        [columns]="columns"
        [rows]="rows()"
        [meta]="meta()"
        [sort]="sort()"
        [rowTrackBy]="rowTrackBy"
        [showRefresh]="true"
        [refreshing]="isRefreshing()"
        [loading]="isPageLoading()"
        [error]="listError()"
        emptyMessage="No shipments match these filters."
        [showFilter]="true"
        [showExport]="true"
        (sortChange)="onSort($event)"
        (refreshClick)="refetch({ soft: true })"
        (filterClick)="openFilters()"
        (exportClick)="exportCsv()"
        (pageChange)="onPageChange($event)"
        (sizeChange)="onSizeChange($event)"
      >
        <ng-template aiesCellDef="reference" let-row>
          <div class="flex items-center gap-1">
            <span class="font-medium">{{ row.reference }}</span>
            <aies-copy
              [value]="row.reference"
              [ariaLabel]="'Copy ' + row.reference"
            />
          </div>
        </ng-template>

        <ng-template aiesCellDef="status" let-row>
          <aies-chip [variant]="statusVariant(row.status)">{{ row.status }}</aies-chip>
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

        <ng-template aiesRowDetail="Destination" let-row>
          <span class="font-medium">{{ row.destination }}</span>
        </ng-template>

        <ng-template aiesRowDetail="Declared value" let-row>
          <span class="tabular-nums">{{ formatUsd(row.valueUsd) }}</span>
        </ng-template>

        <ng-template aiesRowDetail="Status" let-row>
          <aies-chip [variant]="statusVariant(row.status)">{{ row.status }}</aies-chip>
        </ng-template>
      </aies-table>
  \`,
})
export class ShipmentListPageComponent {
  private readonly api = inject(ApiClient);
  private readonly filterQuery = inject(FilterQueryService);
  private readonly urlState = this.filterQuery.read(trackShipmentsFilterConfig);

  protected readonly page = signal(this.urlState.page ?? 1);
  protected readonly size = signal(this.urlState.size ?? PAGE_SIZE);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly rows = signal<Shipment[]>([]);
  protected readonly meta = signal<PaginationMetaModel | null>(null);
  protected readonly fetchError = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isRefreshing = signal(false);
  protected readonly isPageLoading = signal(false);

  protected readonly columns: TableColumn<Shipment>[] = [
    { key: 'reference', header: 'Reference', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'mode', header: 'Mode' },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'valueUsd', header: 'Value', sortable: true },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected readonly rowTrackBy = (row: Shipment) => row.reference;

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

  protected readonly listState = computed((): AsyncQueryStateModel<Shipment[]> => ({
    data: this.rows(),
    isLoading: this.isLoading(),
    isFetching: this.isRefreshing() || this.isPageLoading(),
    isError: this.fetchError() != null,
    error: this.fetchError(),
  }));

  constructor() {
    this.refetch();
  }

  protected async refetch(opts?: { soft?: boolean; page?: boolean }): Promise<void> {
    const soft = opts?.soft === true;
    const page = opts?.page === true;
    const hadData = this.rows().length > 0;
    this.isLoading.set(!hadData && !soft && !page);
    this.isRefreshing.set(soft);
    this.isPageLoading.set(page);
    this.fetchError.set(null);
    try {
      const currentSort = this.sort();
      const res = await firstValueFrom(
        this.api.getResource<Shipment>('shipments', null, {
          page: this.page(),
          size: this.size(),
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
      this.isRefreshing.set(false);
      this.isPageLoading.set(false);
    }
  }

  protected onSort(change: TableSortChange): void {
    this.sort.set(change);
    this.page.set(1);
    void this.refetch({ page: true });
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
    void this.refetch({ page: true });
  }

  protected onSizeChange(next: number): void {
    this.size.set(next);
    this.page.set(1);
    void this.refetch({ page: true });
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

  protected exportCsv(): void {
    downloadCsv({
      filename: 'shipments.csv',
      headers: ['Reference', 'Status', 'Destination', 'Value (USD)'],
      rows: this.rows().map((row) => [
        row.reference,
        row.status,
        row.destination,
        row.valueUsd,
      ]),
    });
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
// meta = computed((): PaginationMetaModel => ({ /* derived from ALL_ROWS.length */ }));
`;

export /**
 *
 */
const TABLE_COMPACT = `// Plain text columns only — no aiesCellDef needed; cells render String(row[key]).
// Fine for small previews; skip AsyncState/pagination if the set is static.

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

  protected readonly rows: Shipment[] = [
    { reference: 'SFN-1042', destination: 'Lagos', status: 'In transit' },
    { reference: 'STN-2088', destination: 'Accra', status: 'Delivered' },
    { reference: 'SFN-1099', destination: 'Nairobi', status: 'Pending' },
  ];
}
`;

export /**
 *
 */
const TABLE_CONTENT_STACK = `// Stacked title / subtitle / extra line. Drop into a table cell (or a detail panel).
// The table row grows to fit — no extra layout work.

import { Component } from '@angular/core';
import { ContentStackComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-packaged-by',
  standalone: true,
  imports: [ContentStackComponent],
  template: \`
    <aies-content-stack
      title="Oladotun Adedeji"
      subtitle="oladotun.a@africanies.com"
      extraLine="Aug 14, 2026, 2:04:22 PM"
    />
  \`,
})
export class PackagedByComponent {}
`;

export /**
 *
 */
const TABLE_CUSTOMERS = `// Customer list: switch columns by account type (individual vs business).
// User: date created, customer, attempts, identifier, status, performed by, action.
// Business: date created, business, attempts, company type, incorp no, incorp date, website, status, action.

protected readonly userColumns: TableColumn<CustomerRow>[] = [
  { key: 'createdAt', header: 'Date created', sortable: true },
  { key: 'customer', header: 'Customer' },
  { key: 'attempts', header: 'Attempts', sortable: true },
  { key: 'identifier', header: 'Identifier' },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'performedBy', header: 'Performed by' },
  { key: 'actions', header: 'Action', width: '3.5rem' },
];

protected readonly businessColumns: TableColumn<CustomerRow>[] = [
  { key: 'createdAt', header: 'Date created', sortable: true },
  { key: 'business', header: 'Business' },
  { key: 'attempts', header: 'Attempts', sortable: true },
  { key: 'companyType', header: 'Company type' },
  { key: 'incorpNo', header: 'Incorp no' },
  { key: 'incorpDate', header: 'Incorp date' },
  { key: 'website', header: 'Website' },
  { key: 'status', header: 'Status', sortable: true },
  { key: 'actions', header: 'Action', width: '3.5rem' },
];
`;
