import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ShippingModeService } from '@africanies/africanies-core';
import type { AsyncQueryStateModel, FilterStateModel, PaginationMetaModel } from '@africanies/africanies-models';
import {
  ActionMenuComponent,
  type AfricaniesMenuItem,
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
} from '@africanies/africanies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  TABLE_COMPACT,
  TABLE_CONTENT_STACK,
  TABLE_CUSTOMERS,
  TABLE_LIST,
} from '../snippets';

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

type KycStatus = 'Pending' | 'Approved' | 'Rejected';

interface DemoCustomer {
  id: string;
  createdAt: Date;
  name: string;
  email: string;
  attempts: number;
  identifier: string;
  status: KycStatus;
  performedBy: string;
  companyType: string;
  incorpNo: string;
  incorpDate: Date;
  website: string;
}

const KYC_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
] as const satisfies readonly KycStatus[];

const CUSTOMER_NAMES = [
  { name: 'Ada Okonkwo', email: 'ada.okonkwo@example.com' },
  { name: 'Chinedu Bello', email: 'chinedu.bello@example.com' },
  { name: 'Fatima Yusuf', email: 'fatima.yusuf@example.com' },
] as const;

const BUSINESS_NAMES = [
  { name: 'Acme Logistics Ltd', email: 'ops@acmelogistics.ng' },
  { name: 'Naija Trade Co', email: 'hello@naijatrade.co' },
  { name: 'Sahara Imports Plc', email: 'contact@saharaimports.com' },
] as const;

const COMPANY_TYPES = ['Ltd', 'Llc', 'Plc'] as const;

const BUSINESS_SITES = [
  'https://acmelogistics.ng',
  'https://naijatrade.co',
  'https://saharaimports.com',
] as const;

const USER_ROWS: DemoCustomer[] = Array.from({ length: 6 }, (_, i) => {
  const person = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length] ?? CUSTOMER_NAMES[0];
  return {
    id: `USR-${2000 + i}`,
    createdAt: new Date(Date.UTC(2026, 6, 4 + i, 10, 12)),
    name: person.name,
    email: person.email,
    attempts: (i % 4) + 1,
    identifier: `NIN-${800100 + i}`,
    status: KYC_STATUSES[i % KYC_STATUSES.length] ?? 'Pending',
    performedBy: PACKAGERS[i % PACKAGERS.length]?.name ?? 'Oladotun Adedeji',
    companyType: '',
    incorpNo: '',
    incorpDate: new Date(Date.UTC(2019, 2, 12)),
    website: '',
  };
});

const BUSINESS_ROWS: DemoCustomer[] = Array.from({ length: 6 }, (_, i) => {
  const company = BUSINESS_NAMES[i % BUSINESS_NAMES.length] ?? BUSINESS_NAMES[0];
  return {
    id: `BIZ-${3000 + i}`,
    createdAt: new Date(Date.UTC(2026, 5, 8 + i, 9, 30)),
    name: company.name,
    email: company.email,
    attempts: (i % 3) + 1,
    identifier: '',
    status: KYC_STATUSES[i % KYC_STATUSES.length] ?? 'Pending',
    performedBy: PACKAGERS[i % PACKAGERS.length]?.name ?? 'Oladotun Adedeji',
    companyType: COMPANY_TYPES[i % COMPANY_TYPES.length] ?? 'Ltd',
    incorpNo: `RC-${10400 + i}`,
    incorpDate: new Date(Date.UTC(2018 + (i % 6), 3, 15)),
    website: BUSINESS_SITES[i % BUSINESS_SITES.length] ?? BUSINESS_SITES[0],
  };
});

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
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Table & pagination"
        description="Presentational data grid with sortable columns, template cells, and optional pager. Loading, empty, and error states render in the body so the toolbar and headers stay available."
      />

      <app-demo-section
        title="Shipments list"
        hint="Full list pattern: toolbar (refresh / filters / export), custom cells, expandable row details, row action menu, and [meta] for server-style pagination. Refresh spins the button only; page/size and first load show a body spinner. Empty and error keep Filters available."
        badge="template cells"
        [code]="tableCode"
      >
        <div class="mb-4 flex flex-wrap gap-2">
          @for (kind of listKinds; track kind) {
            <button
              africanies-button
              type="button"
              size="sm"
              [variant]="listDemo() === kind ? 'primary' : 'secondary'"
              (click)="setListDemo(kind)"
            >
              {{ kind }}
            </button>
          }
        </div>

        <africanies-table
            [columns]="columns"
            [rows]="listState().data ?? []"
            [meta]="meta()"
            [sort]="sort()"
            [rowTrackBy]="rowTrackBy"
            [showRefresh]="true"
            [refreshing]="refreshing()"
            [loading]="listState().isLoading || pageLoading()"
            [error]="listState().error"
            emptyMessage="No shipments match these filters."
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
            <ng-template africaniesCellDef="reference" let-row>
              <div class="flex items-center gap-1">
                <span class="font-medium text-ink dark:text-white">{{
                  row.reference
                }}</span>
                <africanies-copy
                  [value]="row.reference"
                  [ariaLabel]="'Copy ' + row.reference"
                />
              </div>
            </ng-template>
            <ng-template africaniesCellDef="status" let-row>
              <africanies-chip [variant]="statusVariant(row.status)">
                {{ row.status }}
              </africanies-chip>
            </ng-template>
            <ng-template africaniesCellDef="mode" let-row>
              <africanies-chip
                [variant]="row.mode === 'sfn' ? 'export' : 'import'"
              >
                {{ row.mode.toUpperCase() }}
              </africanies-chip>
            </ng-template>
            <ng-template africaniesCellDef="valueUsd" let-row>
              <span class="tabular-nums text-body-sm text-ink dark:text-white">
                {{ formatUsd(row.valueUsd) }}
              </span>
            </ng-template>
            <ng-template africaniesCellDef="packagedBy" let-row>
              <africanies-content-stack
                [title]="row.packagedBy.name"
                [subtitle]="row.packagedBy.email"
                [extraLine]="formatStamp(row.packagedBy.at)"
              />
            </ng-template>
            <ng-template africaniesCellDef="actions" let-row>
              <africanies-action-menu
                [items]="rowActions(row)"
                [ariaLabel]="'Actions for ' + row.reference"
              />
            </ng-template>
            <ng-template africaniesRowDetail="Destination" let-row>
              <span class="font-medium">{{ row.destination }}</span>
            </ng-template>
            <ng-template africaniesRowDetail="Declared value" let-row>
              <span class="tabular-nums font-medium">{{
                formatUsd(row.valueUsd)
              }}</span>
            </ng-template>
            <ng-template africaniesRowDetail="Mode" let-row>
              <africanies-chip [variant]="row.mode === 'sfn' ? 'export' : 'import'">
                {{ row.mode === 'sfn' ? 'Export (SFN)' : 'Import (STN)' }}
              </africanies-chip>
            </ng-template>
            <ng-template africaniesRowDetail="Status" let-row>
              <africanies-chip [variant]="statusVariant(row.status)">
                {{ row.status }}
              </africanies-chip>
            </ng-template>
          </africanies-table>
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
        title="Customers — user vs business"
        hint="Same table; switch the column set. User: date created, customer, attempts, identifier, status, performed by, action. Business: date created, business, attempts, company type, incorp no, incorp date, website, status, action."
        badge="columns"
        [code]="customersCode"
      >
        <div class="mb-4 flex flex-wrap gap-2">
          @for (kind of accountKinds; track kind) {
            <button
              africanies-button
              type="button"
              size="sm"
              [variant]="accountKind() === kind ? 'primary' : 'secondary'"
              (click)="accountKind.set(kind)"
            >
              {{ kind }}
            </button>
          }
        </div>

        <africanies-table
          [columns]="customerColumns()"
          [rows]="customerRows()"
          [rowTrackBy]="customerTrackBy"
        >
          <ng-template africaniesCellDef="createdAt" let-row>
            <span class="whitespace-nowrap text-body-sm tabular-nums">
              {{ formatDate(row.createdAt) }}
            </span>
          </ng-template>
          <ng-template africaniesCellDef="customer" let-row>
            <africanies-content-stack [title]="row.name" [subtitle]="row.email" />
          </ng-template>
          <ng-template africaniesCellDef="business" let-row>
            <africanies-content-stack [title]="row.name" [subtitle]="row.email" />
          </ng-template>
          <ng-template africaniesCellDef="identifier" let-row>
            <div class="flex items-center gap-1">
              <span class="font-medium tabular-nums">{{ row.identifier }}</span>
              <africanies-copy
                [value]="row.identifier"
                [ariaLabel]="'Copy ' + row.identifier"
              />
            </div>
          </ng-template>
          <ng-template africaniesCellDef="status" let-row>
            <africanies-chip [variant]="kycStatusVariant(row.status)">
              {{ row.status }}
            </africanies-chip>
          </ng-template>
          <ng-template africaniesCellDef="incorpDate" let-row>
            <span class="whitespace-nowrap text-body-sm tabular-nums">
              {{ formatDate(row.incorpDate) }}
            </span>
          </ng-template>
          <ng-template africaniesCellDef="website" let-row>
            <a
              class="text-body-sm text-ink underline-offset-2 hover:underline dark:text-white"
              [href]="row.website"
              target="_blank"
              rel="noopener"
            >
              {{ row.website.replace('https://', '') }}
            </a>
          </ng-template>
          <ng-template africaniesCellDef="actions" let-row>
            <africanies-action-menu
              [items]="customerActions(row)"
              [ariaLabel]="'Actions for ' + row.name"
            />
          </ng-template>
        </africanies-table>
      </app-demo-section>

      <app-demo-section
        title="Content stack"
        hint="Stacked title / subtitle / extra line — use in table cells or detail panels. The row grows to fit."
        [code]="contentStackCode"
      >
        <africanies-content-stack
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
        <africanies-table [columns]="compactColumns" [rows]="pageRows().slice(0, 3)" />
      </app-demo-section>
    </div>
  `,
})
export class TablePage {
  private readonly filterDrawer = inject(FilterDrawerService);
  private readonly filterQuery = inject(FilterQueryService);
  private readonly route = inject(ActivatedRoute);
  private readonly shipping = inject(ShippingModeService);
  private lastShippingMode = this.shipping.mode();

  protected readonly page = signal(1);
  protected readonly pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly listDemo = signal<'ready' | 'loading' | 'empty' | 'error'>('ready');
  protected readonly lastRowAction = signal<string | null>(null);
  protected readonly lastExpandedRow = signal<string | null>(null);
  protected readonly lastExport = signal<string | null>(null);
  protected readonly filterState = signal<FilterStateModel>(emptyFilterState());
  protected readonly refreshing = signal(false);
  protected readonly pageLoading = signal(false);
  protected readonly modeLoading = signal(false);

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

  protected readonly rowActions = (row: DemoShipment): AfricaniesMenuItem[] => [
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

  protected readonly accountKind = signal<'user' | 'business'>('user');
  protected readonly accountKinds = ['user', 'business'] as const;

  protected readonly userColumns: TableColumn<DemoCustomer>[] = [
    { key: 'createdAt', header: 'Date created', sortable: true },
    { key: 'customer', header: 'Customer' },
    { key: 'attempts', header: 'Attempts', sortable: true },
    { key: 'identifier', header: 'Identifier' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'performedBy', header: 'Performed by' },
    { key: 'actions', header: 'Action', width: '3.5rem' },
  ];

  protected readonly businessColumns: TableColumn<DemoCustomer>[] = [
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

  protected readonly customerColumns = computed(() =>
    this.accountKind() === 'business' ? this.businessColumns : this.userColumns,
  );

  protected readonly customerRows = computed(() =>
    this.accountKind() === 'business' ? BUSINESS_ROWS : USER_ROWS,
  );

  protected readonly customerTrackBy = (row: DemoCustomer) => row.id;

  protected readonly customersCode = TABLE_CUSTOMERS;

  constructor() {
    this.syncFromUrl();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
      this.syncFromUrl();
    });
    effect(() => {
      const mode = this.shipping.mode();
      if (mode === this.lastShippingMode) {
        return;
      }
      this.lastShippingMode = mode;
      untracked(() => this.onShippingModeChange());
    });
  }

  protected readonly tableCode = TABLE_LIST;
  protected readonly compactCode = TABLE_COMPACT;
  protected readonly contentStackCode = TABLE_CONTENT_STACK;

  protected readonly sortedRows = computed(() => {
    const current = this.sort();
    const mode = this.shipping.mode();
    const rows = ALL_ROWS.filter((row) => row.mode === mode);
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
    if (this.modeLoading()) {
      return {
        data: undefined,
        isLoading: true,
        isFetching: true,
        isError: false,
        error: null,
      };
    }
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
    this.runPageLoad(() => this.page.set(next));
  }

  protected onSizeChange(next: number): void {
    this.runPageLoad(() => {
      this.pageSize.set(next);
      this.page.set(1);
    });
  }

  /** STN↔SFN: drop current rows and show the body loader — data is for the other mode. */
  private onShippingModeChange(): void {
    if (this.modeLoading()) {
      return;
    }
    this.modeLoading.set(true);
    this.page.set(1);
    this.listDemo.set('ready');
    setTimeout(() => this.modeLoading.set(false), 500);
  }

  /** Simulate a server page fetch: keep rows, spin the pager, then apply the change. */
  private runPageLoad(apply: () => void): void {
    if (this.pageLoading()) {
      return;
    }
    this.pageLoading.set(true);
    setTimeout(() => {
      apply();
      this.pageLoading.set(false);
    }, 500);
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

  protected readonly customerActions = (row: DemoCustomer): AfricaniesMenuItem[] => [
    {
      label: 'Open',
      icon: 'eye',
      onClick: () => this.lastRowAction.set(`Open · ${row.name}`),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => this.lastRowAction.set(`Edit · ${row.name}`),
    },
  ];

  protected kycStatusVariant(status: KycStatus): ChipVariant {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
    }
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

  protected formatDate(value: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
