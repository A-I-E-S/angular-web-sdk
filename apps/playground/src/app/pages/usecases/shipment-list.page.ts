import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import type { FilterStateModel, PaginationMetaModel } from '@africanies/africanies-models';
import {
  ActionMenuComponent,
  type AfricaniesMenuItem,
  CellDefDirective,
  ChipComponent,
  type ChipVariant,
  DEFAULT_PAGE_SIZE,
  emptyFilterState,
  FilterDrawerService,
  FilterQueryService,
  type TableColumn,
  TableComponent,
  toFilterParams,
  trackShipmentsFilterConfig,
} from '@africanies/africanies-ui';

import { DemoSectionComponent } from '../../shared/demo-section.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { USECASE_SHIPMENT_BACK } from '../../snippets';
import { USECASE_SHIPMENTS, type UsecaseShipment } from './shipment-data';

const FILTER_CONFIG = trackShipmentsFilterConfig;

/**
 * Parent list — no Back. Filters and the pager sync to the URL. Row actions
 * open a child detail route and keep those queries so Back restores the list.
 */
@Component({
  selector: 'app-shipment-list-page',
  standalone: true,
  imports: [
    ActionMenuComponent,
    CellDefDirective,
    ChipComponent,
    TableComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Use cases"
        title="Back button and Breadcrumbs"
        description="You do not implement Back or breadcrumbs — they ship with africanies-app-shell. This list also hydrates filters and pagination from the URL, so a shared link (or Back from detail) reopens the same page and criteria."
      />

      <app-demo-section
        title="Example: list to detail"
        hint="Filter or change page — the address bar updates. Open ⋯ → View details, then Back: the same queries return. Paste this list URL in a new tab and it restores too."
        badge="built-in"
        [code]="routeCode"
      >
        <africanies-table
          [columns]="columns"
          [rows]="pageRows()"
          [meta]="meta()"
          [showFilter]="true"
          [filterCount]="activeFilterCount()"
          [rowTrackBy]="rowTrackBy"
          (filterClick)="openFilters()"
          (pageChange)="onPageChange($event)"
          (sizeChange)="onSizeChange($event)"
        >
          <ng-template africaniesCellDef="reference" let-row>
            <span class="font-medium text-ink dark:text-white">{{
              row.reference
            }}</span>
          </ng-template>
          <ng-template africaniesCellDef="status" let-row>
            <africanies-chip [variant]="statusVariant(row.status)">
              {{ row.status }}
            </africanies-chip>
          </ng-template>
          <ng-template africaniesCellDef="actions" let-row>
            <africanies-action-menu
              [items]="rowActions(row)"
              [ariaLabel]="'Actions for ' + row.reference"
            />
          </ng-template>
        </africanies-table>
      </app-demo-section>
    </div>
  `,
})
export class ShipmentListPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly filterDrawer = inject(FilterDrawerService);
  private readonly filterQuery = inject(FilterQueryService);

  protected readonly routeCode = USECASE_SHIPMENT_BACK;
  protected readonly page = signal(1);
  protected readonly pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  protected readonly filterState = signal<FilterStateModel>(emptyFilterState());

  constructor() {
    this.syncFromUrl();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(() => {
      this.syncFromUrl();
    });
  }

  protected readonly columns: TableColumn<UsecaseShipment>[] = [
    { key: 'reference', header: 'Reference' },
    { key: 'route', header: 'Route' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '', width: '3.5rem' },
  ];

  protected readonly rowTrackBy = (row: UsecaseShipment) => row.reference;

  protected readonly filteredRows = computed(() => {
    const state = this.filterState();
    const search = state.search?.trim().toLowerCase();
    const shipmentStatus = state.values['shipment_status'];
    const paymentStatus = state.values['payment_status'];
    const tracking = state.values['tracking_number']?.trim().toLowerCase();
    return USECASE_SHIPMENTS.filter((row) => {
      if (
        search &&
        !row.reference.toLowerCase().includes(search) &&
        !row.trackingNumber.toLowerCase().includes(search)
      ) {
        return false;
      }
      if (shipmentStatus && row.shipmentStatus !== shipmentStatus) {
        return false;
      }
      if (paymentStatus && row.paymentStatus !== paymentStatus) {
        return false;
      }
      if (
        tracking &&
        !row.trackingNumber.toLowerCase().includes(tracking)
      ) {
        return false;
      }
      return true;
    });
  });

  protected readonly pageRows = computed(() => {
    const size = this.pageSize();
    const start = (this.page() - 1) * size;
    return this.filteredRows().slice(start, start + size);
  });

  protected readonly meta = computed((): PaginationMetaModel => {
    const per_page = this.pageSize();
    const total_items = this.filteredRows().length;
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

  protected readonly activeFilterCount = computed(() => {
    const params = toFilterParams(this.filterState(), FILTER_CONFIG);
    return Object.keys(params).filter(
      (key) =>
        key !== 'page' &&
        key !== 'size' &&
        key !== 'order' &&
        key !== 'per_page',
    ).length;
  });

  protected statusVariant(status: UsecaseShipment['status']): ChipVariant {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Exception':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  protected rowActions(row: UsecaseShipment): AfricaniesMenuItem[] {
    return [
      {
        label: 'View details',
        icon: 'eye',
        onClick: () => {
          void this.router.navigate(['/usecases/shipment', row.reference], {
            queryParamsHandling: 'preserve',
          });
        },
      },
    ];
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
        config: FILTER_CONFIG,
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

  /**
   * Seed pager + filters from the URL when those queries are present.
   */
  private syncFromUrl(): void {
    const state = this.filterQuery.read(FILTER_CONFIG);
    this.filterState.set(state);
    this.page.set(state.page ?? 1);
    this.pageSize.set(state.size ?? DEFAULT_PAGE_SIZE);
  }
}
