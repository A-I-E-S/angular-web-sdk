import { Component, computed, signal } from '@angular/core';
import type { AsyncQueryState, PaginationMeta } from '@aies/aies-models';
import {
  AsyncStateComponent,
  ButtonComponent,
  CellDefDirective,
  PaginationComponent,
  TableComponent,
  type TableColumn,
  type TableSortChange,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';

interface DemoShipment {
  reference: string;
  status: 'In transit' | 'Delivered' | 'Pending' | 'Exception';
  mode: 'sfn' | 'stn';
  destination: string;
  valueUsd: number;
}

const ALL_ROWS: DemoShipment[] = Array.from({ length: 28 }, (_, i) => ({
  reference: `${i % 2 === 0 ? 'SFN' : 'STN'}-${1000 + i}`,
  status: (['In transit', 'Delivered', 'Pending', 'Exception'] as const)[i % 4]!,
  mode: i % 2 === 0 ? 'sfn' : 'stn',
  destination: ['Lagos', 'Accra', 'Nairobi', 'Cairo', 'London'][i % 5]!,
  valueUsd: 400 + i * 175,
}));

const PAGE_SIZE = 6;

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [
    TableComponent,
    PaginationComponent,
    CellDefDirective,
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
        hint="Sort emits upward; paging uses PaginationMeta from the API envelope."
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
            [sort]="sort()"
            (sortChange)="onSort($event)"
          >
            <ng-template aiesCellDef="status" let-row>
              <span
                class="inline-flex rounded-md px-2 py-0.5 text-caption font-medium"
                [class.bg-export-subtle]="row.status === 'Delivered'"
                [class.text-export]="row.status === 'Delivered'"
                [class.bg-import-subtle]="row.status === 'In transit'"
                [class.text-import]="row.status === 'In transit'"
                [class.bg-warning-subtle]="row.status === 'Pending'"
                [class.text-warning-dark]="row.status === 'Pending'"
                [class.bg-danger-subtle]="row.status === 'Exception'"
                [class.text-danger]="row.status === 'Exception'"
              >
                {{ row.status }}
              </span>
            </ng-template>
            <ng-template aiesCellDef="mode" let-row>
              <span
                class="text-caption font-medium uppercase tracking-wide"
                [class.text-export]="row.mode === 'sfn'"
                [class.text-import]="row.mode === 'stn'"
              >
                {{ row.mode }}
              </span>
            </ng-template>
            <ng-template aiesCellDef="valueUsd" let-row>
              <span class="tabular-nums text-body-sm text-ink dark:text-white">
                {{ formatUsd(row.valueUsd) }}
              </span>
            </ng-template>
            <ng-template aiesCellDef="actions" let-row>
              <div class="flex gap-1">
                <button aies-button type="button" variant="ghost" size="sm">
                  Open
                </button>
                <button aies-button type="button" variant="ghost" size="sm">
                  {{ row.reference }}
                </button>
              </div>
            </ng-template>
          </aies-table>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="m-0 text-caption text-neutral-600">
              Showing {{ pageRows().length }} of {{ meta().totalItems }} · page
              {{ meta().currentPage }} / {{ meta().totalPages }}
            </p>
            <aies-pagination [meta]="meta()" (pageChange)="onPageChange($event)" />
          </div>
        </aies-async-state>
      </app-demo-section>

      <app-demo-section title="Compact / text-only columns" muted [code]="compactCode">
        <aies-table [columns]="compactColumns" [rows]="pageRows().slice(0, 3)" />
      </app-demo-section>
    </div>
  `,
})
export class TablePage {
  protected readonly page = signal(1);
  protected readonly sort = signal<TableSortChange | null>(null);
  protected readonly listDemo = signal<'ready' | 'loading' | 'empty' | 'error'>('ready');

  protected readonly listKinds = ['ready', 'loading', 'empty', 'error'] as const;

  protected readonly columns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference', sortable: true },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'mode', header: 'Mode' },
    { key: 'destination', header: 'Destination', sortable: true },
    { key: 'valueUsd', header: 'Value', sortable: true, width: '7rem' },
    { key: 'actions', header: '', width: '11rem' },
  ];

  protected readonly compactColumns: TableColumn<DemoShipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'destination', header: 'Destination' },
    { key: 'status', header: 'Status' },
  ];

  protected readonly tableCode = `import {
  AsyncStateComponent,
  TableComponent,
  CellDefDirective,
  PaginationComponent,
} from '@aies/aies-ui';

<aies-async-state [state]="listState()" (retry)="refetch()">
  <aies-table
    [columns]="columns"
    [rows]="pageRows()"
    [sort]="sort()"
    (sortChange)="onSort($event)"
  >
    <ng-template aiesCellDef="status" let-row>
      {{ row.status }}
    </ng-template>
  </aies-table>
  <aies-pagination [meta]="meta()" (pageChange)="onPageChange($event)" />
</aies-async-state>`;

  protected readonly compactCode = `<aies-table [columns]="columns" [rows]="rows" />`;

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

  protected readonly meta = computed((): PaginationMeta => {
    const totalItems = this.sortedRows().length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentPage = Math.min(this.page(), totalPages);
    return {
      currentPage,
      perPage: PAGE_SIZE,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  });

  protected readonly listState = computed((): AsyncQueryState<DemoShipment[]> => {
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

  protected formatUsd(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
