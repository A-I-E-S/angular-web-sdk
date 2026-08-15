import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import type { AsyncQueryStateModel, FilterStateModel, PaginationMetaModel } from '@aies/aies-models';
import {
  ActionMenuComponent,
  type AiesMenuItem,
  AsyncStateComponent,
  ButtonComponent,
  CellDefDirective,
  ChipComponent,
  type ChipVariant,
  ContentStackComponent,
  CopyButtonComponent,
  DEFAULT_PAGE_SIZE,
  emptyFilterState,
  FilterDrawerService,
  FilterQueryService,
  RowDetailDefDirective,
  type TableColumn,
  TableComponent,
  type TableSortChange,
  toFilterParams,
  trackShipmentsFilterConfig,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { TABLE_COMPACT, TABLE_CONTENT_STACK, TABLE_LIST } from '../snippets';

interface DemoShipment {
  reference: string;
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  mode: 'sfn' | 'stn';
  destination: string;
  valueUsd: number;
  packagedBy: {
    name: string;
    email: string;
    at: Date;
  };
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

const PACKAGERS = [
  {
    name: 'Oladotun Adedeji',
    email: 'oladotun.a@africanies.com',
  },
  {
    name: 'Ada Okonkwo',
    email: 'ada.o@africanies.com',
  },
  {
    name: 'Chinedu Bello',
    email: 'chinedu.b@africanies.com',
  },
] as const;

const ALL_ROWS: DemoShipment[] = Array.from({ length: 28 }, (_, i) => {
  const packager = PACKAGERS[i % PACKAGERS.length] ?? {
    name: 'Oladotun Adedeji',
    email: 'oladotun.a@africanies.com',
  };
  return {
    reference: `${i % 2 === 0 ? 'SFN' : 'STN'}-${1000 + i}`,
    status: STATUSES[i % STATUSES.length] ?? 'Pending',
    mode: i % 2 === 0 ? 'sfn' : 'stn',
    destination: DESTINATIONS[i % DESTINATIONS.length] ?? 'Lagos',
    valueUsd: 400 + i * 175,
    packagedBy: {
      name: packager.name,
      email: packager.email,
      at: new Date(Date.UTC(2026, 7, 14, 13, 4, 22 + i)),
    },
  };
});

/**
 *
 */
@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    TableComponent,
    CellDefDirective,
    RowDetailDefDirective,
    ActionMenuComponent,
    ChipComponent,
    ContentStackComponent,
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
        description="Presentational data grid with sortable columns, template cells, and optional pager. It does not load data itself — wrap it in AsyncState (or your own loading UI) for fetch states."
      />

      <app-demo-section
        title="Shipments list"
        hint="Full list pattern: toolbar (refresh / filters / export), custom cells, expandable row details, row action menu, and [meta] for server-style pagination. Refresh keeps the rows and shows a thin bar — use the scenario buttons for first-load and empty."
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
            [rowTrackBy]="rowTrackBy"
            [showRefresh]="true"
            [refreshing]="refreshing()"
            [showFilter]="true"
            [showExport]="true"
            [filterCount]="activeFilterCount()"
            (sortChange)="onSort($event)"
            (refreshClick)="onRefresh()"
            (filterClick)="openFilters()"
            (exportClick)="onExport()"
            (pageChange)="onPageChange($event)"
            (sizeChange)="onSizeChange($event)"
            (rowExpandChange)="onRowExpand($event)"
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
            <ng-template aiesCellDef="packagedBy" let-row>
              <aies-content-stack
                [title]="row.packagedBy.name"
                [subtitle]="row.packagedBy.email"
                [extraLine]="formatStamp(row.packagedBy.at)"
              />
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
              <span class="tabular-nums font-medium">{{
                formatUsd(row.valueUsd)
              }}</span>
            </ng-template>
            <ng-template aiesRowDetail="Mode" let-row>
              <aies-chip [variant]="row.mode === 'sfn' ? 'export' : 'import'">
                {{ row.mode === 'sfn' ? 'Export (SFN)' : 'Import (STN)' }}
              </aies-chip>
            </ng-template>
            <ng-template aiesRowDetail="Status" let-row>
              <aies-chip [variant]="statusVariant(row.status)">
                {{ row.status }}
              </aies-chip>
            </ng-template>
          </aies-table>
        </aies-async-state>
        @if (lastRowAction()) {
          <p class="mt-3 m-0 text-caption text-neutral-600 dark:text-neutral-400">
            Last row action: {{ lastRowAction() }}
          </p>
        }
        @if (lastExpandedRow()) {
          <p class="mt-1 m-0 text-caption text-neutral-600 dark:text-neutral-400">
            Expanded row: {{ lastExpandedRow() }}
          </p>
        }
        @if (lastExport()) {
          <p class="mt-1 m-0 text-caption text-neutral-600 dark:text-neutral-400">
            {{ lastExport() }}
          </p>
        }
      </app-demo-section>

      <app-demo-section
        title="Content stack"
        hint="Stacked title / subtitle / extra line — use in table cells or detail panels. The row grows to fit."
        [code]="contentStackCode"
      >
        <aies-content-stack
          title="Oladotun Adedeji"
          subtitle="oladotun.a@africanies.com"
          extraLine="Aug 14, 2026, 2:04:22 PM"
        />
      </app-demo-section>

      <app-demo-section
        title="Compact / text-only columns"
        hint="Minimal columns with no toolbar chrome — good for nested summaries or dense side panels."
        muted
        [code]="compactCode"
      >
        <aies-table [columns]="compactColumns" [rows]="pageRows().slice(0, 3)" />
      </app-demo-section>
    </div>
  `,
})
export class TablePage {
  private readonly filterDrawer = inject(FilterDrawerService);
  private readonly filterQuery = inject(FilterQueryService);
  private readonly route = inject(ActivatedRoute);

  protected readonly page = signal(1);
  protected readonly pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly listDemo = signal<'ready' | 'loading' | 'empty' | 'error'>('ready');
  protected readonly lastRowAction = signal<string | null>(null);
  protected readonly lastExpandedRow = signal<string | null>(null);
  protected readonly lastExport = signal<string | null>(null);
  protected readonly filterState = signal<FilterStateModel>(emptyFilterState());
  protected readonly refreshing = signal(false);

  protected readonly listKinds = ['ready', 'loading', 'empty', 'error'] as const;

  protected readonly activeFilterCount = computed(() => {
    const state = this.filterState();
    const params = toFilterParams(state, trackShipmentsFilterConfig);
    return Object.keys(params).filter(
      (key) =>
        key !== 'page' &&
        key !== 'per_page' &&
        key !== 'size' &&
        key !== 'order',
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

  protected readonly rowTrackBy = (row: DemoShipment) => row.reference;

  protected readonly columns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'mode', header: 'Mode' },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'valueUsd', header: 'Value', sortable: true },
    { key: 'packagedBy', header: 'Packaged by' },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected readonly compactColumns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
  ];

  constructor() {
    this.syncFromUrl();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
      this.syncFromUrl();
    });
  }

  protected readonly tableCode = TABLE_LIST;
  protected readonly compactCode = TABLE_COMPACT;
  protected readonly contentStackCode = TABLE_CONTENT_STACK;

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
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.sortedRows().slice(start, start + size);
  });

  protected readonly meta = computed((): PaginationMetaModel => {
    const per_page = this.pageSize();
    const total_items = this.sortedRows().length;
    const total_pages = Math.max(1, Math.ceil(total_items / per_page));
    const current_page = Math.min(this.page(), total_pages);
    return {
      current_page,
      per_page,
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
          isFetching: this.refreshing(),
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
    void this.filterQuery.setPage(1);
  }

  protected onPageChange(next: number): void {
    this.page.set(next);
  }

  protected onSizeChange(next: number): void {
    this.pageSize.set(next);
    this.page.set(1);
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
    if (this.refreshing()) {
      return;
    }
    this.refreshing.set(true);
    this.setListDemo('ready');
    setTimeout(() => this.refreshing.set(false), 800);
  }

  protected onExport(): void {
    this.lastExport.set(
      `Export clicked · ${this.pageRows().length} rows on this page`,
    );
  }

  protected onRowExpand(event: { row: DemoShipment; expanded: boolean }): void {
    this.lastExpandedRow.set(
      event.expanded ? event.row.reference : null,
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

  protected formatStamp(value: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(value);
  }

  /**
   * Seed pager + filters from the URL (`page`, `size`, filter keys).
   * No-ops into defaults when those queries are absent.
   */
  private syncFromUrl(): void {
    const state = this.filterQuery.read(trackShipmentsFilterConfig);
    this.filterState.set(state);
    this.page.set(state.page ?? 1);
    this.pageSize.set(state.size ?? DEFAULT_PAGE_SIZE);
  }
}
