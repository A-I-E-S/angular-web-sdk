import { Component, computed, inject, signal } from '@angular/core';

import type { AsyncQueryStateModel, FilterStateModel, PaginationMetaModel } from '@aies/aies-models';
import {
  ActionMenuComponent,
  type AiesMenuItem,
  AsyncStateComponent,
  ButtonComponent,
  CellDefDirective,
  ChipComponent,
  type ChipVariant,
  CopyButtonComponent,
  emptyFilterState,
  FilterDrawerService,
  type TableColumn,
  TableComponent,
  type TableSortChange,
  toFilterParams,
  trackShipmentsFilterConfig,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { TABLE_COMPACT, TABLE_LIST } from '../snippets';

interface DemoShipment {
  reference: string;
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  mode: 'sfn' | 'stn';
  destination: string;
  valueUsd: number;
}

const STATUSES = [
  'In transit',
  'Delivered',
  'Pending',
  'Exception',
] as const satisfies readonly DemoShipment['status'][];

const DESTINATIONS = [
  'Lagos',
  'Accra',
  'Nairobi',
  'Cairo',
  'London',
] as const;

const ALL_ROWS: DemoShipment[] = Array.from({ length: 28 }, (_, i) => ({
  reference: `${i % 2 === 0 ? 'SFN' : 'STN'}-${1000 + i}`,
  status: STATUSES[i % STATUSES.length] ?? 'Pending',
  mode: i % 2 === 0 ? 'sfn' : 'stn',
  destination: DESTINATIONS[i % DESTINATIONS.length] ?? 'Lagos',
  valueUsd: 400 + i * 175,
}));

const PAGE_SIZE = 6;

/**
 *
 */
@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    TableComponent,
    CellDefDirective,
    ActionMenuComponent,
    ChipComponent,
    CopyButtonComponent,
    ButtonComponent,
    AsyncStateComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Table & pagination"
        description="Presentational table with template cells. Wrap in AsyncState for loading — the table never branches on fetch state itself."
      />

      <app-demo-section
        title="Shipments list"
        hint="Refresh on the left; Filters and Export on the right. Pass [meta] for the built-in pager."
        badge="template cells"
        [code]="tableCode"
      >
        <div class="mb-4 flex flex-wrap gap-2">
          @for (kind of listKinds; track kind) {
            <button
              aies-button
              type="button"
              size="sm"
              [variant]="listDemo() === kind ? 'primary' : 'secondary'"
              (click)="setListDemo(kind)"
            >
              {{ kind }}
            </button>
          }
        </div>

        <aies-async-state [state]="listState()" (retry)="setListDemo('ready')">
          <aies-table
            [columns]="columns"
            [rows]="pageRows()"
            [meta]="meta()"
            [sort]="sort()"
            [showRefresh]="true"
            [showFilter]="true"
            [showExport]="true"
            [filterCount]="activeFilterCount()"
            (sortChange)="onSort($event)"
            (refreshClick)="onRefresh()"
            (filterClick)="openFilters()"
            (exportClick)="onExport()"
            (pageChange)="onPageChange($event)"
          >
            <ng-template aiesCellDef="reference" let-row>
              <div class="flex items-center gap-1">
                <span class="font-medium text-ink dark:text-white">{{
                  row.reference
                }}</span>
                <aies-copy
                  [value]="row.reference"
                  [ariaLabel]="'Copy ' + row.reference"
                />
              </div>
            </ng-template>
            <ng-template aiesCellDef="status" let-row>
              <aies-chip [variant]="statusVariant(row.status)">
                {{ row.status }}
              </aies-chip>
            </ng-template>
            <ng-template aiesCellDef="mode" let-row>
              <aies-chip
                [variant]="row.mode === 'sfn' ? 'export' : 'import'"
              >
                {{ row.mode.toUpperCase() }}
              </aies-chip>
            </ng-template>
            <ng-template aiesCellDef="valueUsd" let-row>
              <span class="tabular-nums text-body-sm text-ink dark:text-white">
                {{ formatUsd(row.valueUsd) }}
              </span>
            </ng-template>
            <ng-template aiesCellDef="actions" let-row>
              <aies-action-menu
                [items]="rowActions(row)"
                [ariaLabel]="'Actions for ' + row.reference"
              />
            </ng-template>
          </aies-table>
        </aies-async-state>
        @if (lastRowAction()) {
          <p class="mt-3 m-0 text-caption text-neutral-600 dark:text-neutral-400">
            Last row action: {{ lastRowAction() }}
          </p>
        }
        @if (lastExport()) {
          <p class="mt-1 m-0 text-caption text-neutral-600 dark:text-neutral-400">
            {{ lastExport() }}
          </p>
        }
      </app-demo-section>

      <app-demo-section title="Compact / text-only columns" muted [code]="compactCode">
        <aies-table [columns]="compactColumns" [rows]="pageRows().slice(0, 3)" />
      </app-demo-section>
    </div>
  `,
})
export class TablePage {
  private readonly filterDrawer = inject(FilterDrawerService);

  protected readonly page = signal(1);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly listDemo = signal<'ready' | 'loading' | 'empty' | 'error'>('ready');
  protected readonly lastRowAction = signal<string | null>(null);
  protected readonly lastExport = signal<string | null>(null);
  protected readonly filterState = signal<FilterStateModel>(emptyFilterState());

  protected readonly listKinds = ['ready', 'loading', 'empty', 'error'] as const;

  protected readonly activeFilterCount = computed(() => {
    const state = this.filterState();
    const params = toFilterParams(state, trackShipmentsFilterConfig);
    return Object.keys(params).filter(
      (key) => key !== 'page' && key !== 'per_page' && key !== 'order',
    ).length;
  });

  protected readonly rowActions = (row: DemoShipment): AiesMenuItem[] => [
    {
      label: 'Open',
      icon: 'eye',
      onClick: () => this.lastRowAction.set(`Open · ${row.reference}`),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => this.lastRowAction.set(`Edit · ${row.reference}`),
    },
    {
      label: 'Copy reference',
      icon: 'copy',
      onClick: () => this.lastRowAction.set(`Copy · ${row.reference}`),
    },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.lastRowAction.set(`Delete · ${row.reference}`),
    },
  ];

  protected readonly columns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'mode', header: 'Mode' },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'valueUsd', header: 'Value', sortable: true, width: '7rem' },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected readonly compactColumns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
  ];

  protected readonly tableCode = TABLE_LIST;
  protected readonly compactCode = TABLE_COMPACT;

  protected readonly sortedRows = computed(() => {
    const current = this.sort();
    const rows = [...ALL_ROWS];
    if (!current) {
      return rows;
    }
    const dir = current.direction === 'asc' ? 1 : -1;
    const key = current.key as keyof DemoShipment;
    return rows.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  });

  protected readonly pageRows = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.sortedRows().slice(start, start + PAGE_SIZE);
  });

  protected readonly meta = computed((): PaginationMetaModel => {
    const total_items = this.sortedRows().length;
    const total_pages = Math.max(1, Math.ceil(total_items / PAGE_SIZE));
    const current_page = Math.min(this.page(), total_pages);
    return {
      current_page,
      per_page: PAGE_SIZE,
      total_items,
      total_pages,
      has_next_page: current_page < total_pages,
      has_previous_page: current_page > 1,
    };
  });

  protected readonly listState = computed((): AsyncQueryStateModel<DemoShipment[]> => {
    switch (this.listDemo()) {
      case 'loading':
        return {
          data: undefined,
          isLoading: true,
          isFetching: true,
          isError: false,
          error: null,
        };
      case 'empty':
        return {
          data: [],
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
        };
      case 'error':
        return {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
          error: 'Could not load shipments.',
        };
      default:
        return {
          data: this.pageRows(),
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
        };
    }
  });

  protected setListDemo(kind: 'ready' | 'loading' | 'empty' | 'error'): void {
    this.listDemo.set(kind);
  }

  protected onSort(change: TableSortChange): void {
    this.sort.set(change);
    this.page.set(1);
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
  }

  protected openFilters(): void {
    this.filterDrawer
      .open({
        config: trackShipmentsFilterConfig,
        state: this.filterState(),
        title: 'Filter shipments',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.applied) {
          this.filterState.set(result.state);
          this.page.set(1);
        }
      });
  }

  protected onRefresh(): void {
    // Demo: flash loading then back to ready.
    this.setListDemo('loading');
    setTimeout(() => this.setListDemo('ready'), 600);
  }

  protected onExport(): void {
    this.lastExport.set(
      `Export clicked · ${this.pageRows().length} rows on this page`,
    );
  }

  protected statusVariant(status: DemoShipment['status']): ChipVariant {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'In transit':
        return 'import';
      case 'Pending':
        return 'warning';
      case 'Exception':
        return 'danger';
    }
  }

  protected formatUsd(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
