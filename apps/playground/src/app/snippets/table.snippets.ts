// Table & pagination copy-paste examples.

export /**
 *
 */
const TABLE_LIST = `// Server-driven list: wrap fetch in aies-async-state, keep the table presentational.
// Toolbar: Refresh (left); Filters + Export (right). Pass [meta] for the built-in pager.
// Refetch on sortChange / pageChange / sizeChange. Use aiesCellDef for badges, currency, row menus.
// Expandable rows: aiesRowDetail="Label" let-row for label / component value pairs.
// Column width: omit for equal share; set width (e.g. '3.5rem') to pin actions.

import { Component, computed, inject, signal } from '@angular/core';
import { ApiClient } from '@aies/aies-core';
import type { AsyncQueryStateModel, PaginationMetaModel } from '@aies/aies-models';
import {
  ActionMenuComponent,
  AsyncStateComponent,
  CellDefDirective,
  ChipComponent,
  CopyButtonComponent,
  DEFAULT_PAGE_SIZE,
  RowDetailDefDirective,
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

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [
    AsyncStateComponent,
    TableComponent,
    CellDefDirective,
    RowDetailDefDirective,
    ActionMenuComponent,
    ChipComponent,
    CopyButtonComponent,
  ],
  template: \`
    <aies-async-state [state]="listState()" (retry)="refetch()">
      <aies-table
        [columns]="columns"
        [rows]="rows()"
        [meta]="meta()"
        [sort]="sort()"
        [rowTrackBy]="rowTrackBy"
        [showRefresh]="true"
        [showFilter]="true"
        [showExport]="true"
        (sortChange)="onSort($event)"
        (refreshClick)="refetch()"
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
    </aies-async-state>
  \`,
})
export class ShipmentListPageComponent {
  private readonly api = inject(ApiClient);

  protected readonly page = signal(1);
  protected readonly size = signal(PAGE_SIZE);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly rows = signal<Shipment[]>([]);
  protected readonly meta = signal<PaginationMetaModel | null>(null);
  protected readonly fetchError = signal<string | null>(null);
  protected readonly isLoading = signal(false);

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

  protected onSizeChange(next: number): void {
    this.size.set(next);
    this.page.set(1);
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
