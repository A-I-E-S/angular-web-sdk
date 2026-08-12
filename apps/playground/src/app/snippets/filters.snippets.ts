/**
 * Playground snippets — schema-driven filters.
 */

export /**
 *
 */
const FILTERS_OPEN_APPLY = `
// Open the drawer, await the list refetch, then commit state on success.
// Host owns FilterState; drawer edits a clone. Needs provideAiesUiOverlays().

import { Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  FilterDrawerService,
  emptyFilterState,
  toFilterParams,
  trackShipmentsFilterConfig,
  type FilterState,
} from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-list-filters',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <button aies-button type="button" variant="secondary" (click)="openFilters()">
      Filters
    </button>
  \`,
})
export class ShipmentListFiltersComponent {
  private readonly filterDrawer = inject(FilterDrawerService);
  private readonly http = inject(/* your HttpClient or list service */);

  protected readonly state = signal<FilterState>(emptyFilterState());

  protected openFilters(): void {
    this.filterDrawer
      .open({
        config: trackShipmentsFilterConfig,
        state: this.state(),
        title: 'Track shipments',
        // Stays open until this settles; errors keep it open + show a tip.
        onApply: ({ params }) => this.http.get('/api/shipments', { params }),
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.applied) {
          return; // Cancel / backdrop — leave host state alone
        }
        this.state.set(result.state);
        // Optional: sync the URL with the same bag the API used
        // this.router.navigate([], { queryParams: result.params, queryParamsHandling: '' });
      });
  }
}
`;

export /**
 *
 */
const FILTERS_AUTHOR_CONFIG = `
// Full ModuleFilterConfig — field \`type\` picks the control, \`transport\` how params flatten.
// Shared blocks (search / date / sort / pagination) sit above “Filter by” when present.

import type { ModuleFilterConfig } from '@aies/aies-models';

export const updateShipmentsFilterConfig: ModuleFilterConfig = {
  id: 'update-shipments',
  route: ['portal', 'shipment', 'update-shipments'],
  transport: 'legacy-parallel',
  pagination: { pageParam: 'page', sizeParam: 'size' },
  search: {
    param: 'search',
    label: 'Shipment ID',
    placeholder: 'Search',
  },
  date: {
    rangeParams: { from: 'from', to: 'to' },
    fieldParam: 'date',
    fields: [
      { value: 'created_at', label: 'Date Created' },
      { value: 'paid_at', label: 'Date of Payment' },
      { value: 'packaged_at', label: 'Date Packaged' },
      { value: 'shipment_processed_at', label: 'Date Processed' },
    ],
  },
  sort: {
    param: 'order',
    options: [
      { value: 'asc', label: 'Ascending' },
      { value: 'desc', label: 'Descending' },
    ],
  },
  fields: [
    {
      key: 'payment_status',
      label: 'Payment Status',
      type: 'enum',
      exclusive: true,
      options: [
        { value: 'paid', label: 'Paid', color: '#25945c' },
        { value: 'unpaid', label: 'Unpaid', color: '#f48220' },
      ],
    },
    {
      key: 'shipment_status',
      label: 'Shipment Status',
      type: 'enum',
      exclusive: true,
      options: [
        { value: 'pending', label: 'Pending', color: '#DBB316' },
        { value: 'in-process', label: 'In Process', color: '#3B82F6' },
        { value: 'completed', label: 'Completed', color: '#25945c' },
      ],
    },
    {
      key: 'type',
      label: 'Shipment Type',
      type: 'enum',
      exclusive: true,
      options: [
        { value: 'shipment', label: 'Shipment', color: '#3B82F6' },
        { value: 'etw_shipment', label: 'ETW Shipment', color: '#8B5CF6' },
      ],
    },
    {
      key: 'shipment_method_id',
      label: 'Shipment Carrier',
      type: 'select',
      optionsSource: 'shipmentMethods',
      placeholder: 'Shipment Methods',
    },
    {
      key: 'type_of_user',
      label: 'User Type',
      type: 'select',
      optionsSource: 'static',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'business', label: 'Business' },
      ],
      placeholder: 'User Type',
    },
    {
      key: 'warehouse_id',
      label: 'Warehouse',
      type: 'select',
      optionsSource: 'warehouses',
      placeholder: 'Warehouse',
    },
    {
      key: 'shipment_manifest_id',
      label: 'Shipment Manifest',
      type: 'select',
      optionsSource: 'shipmentManifests',
      placeholder: 'Shipment Manifest',
    },
    {
      key: 'api_request',
      label: 'API Request',
      type: 'boolean',
      options: [
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' },
      ],
    },
    {
      key: 'is_insured',
      label: 'Insured',
      type: 'boolean',
      options: [
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' },
      ],
    },
  ],
};
`;

export /**
 *
 */
const FILTERS_ENUM_COLORS = `
// Status chips. Optional \`color\` tints the selected chip; idle stays neutral.
// color is UI-only — never sent in params.

{
  key: 'shipment_status',
  label: 'Shipment Status',
  type: 'enum',
  exclusive: true, // one value at a time
  options: [
    { value: 'pending', label: 'Pending', color: '#DBB316' },
    { value: 'in-process', label: 'In Process', color: '#3B82F6' },
    { value: 'completed', label: 'Completed', color: '#25945c' },
  ],
}
`;

export /**
 *
 */
const FILTERS_FILTER_BY = `
// “Filter by” lists every config.fields entry; picking one reveals its control.
// Deselect clears that section’s value on Apply. Keep field.key stable.

// User picks “Payment Status” + “Warehouse” in Filter by →
// draft.values = { payment_status: 'paid', warehouse_id: '12' }
`;

export /**
 *
 */
const FILTERS_DATE_RANGE = `
// Date column select + From / To. Clear resets only those three.
// To can’t be before From — moving From past To clears To.

date: {
  rangeParams: { from: 'from', to: 'to' },
  fieldParam: 'date',
  fields: [
    { value: 'created_at', label: 'Date Created' },
    { value: 'paid_at', label: 'Date of Payment' },
  ],
},

// Example state → params
// { date: 'created_at', from: '2026-01-01', to: '2026-01-31' }
`;

export /**
 *
 */
const FILTERS_LEGACY = `
// Laravel-style: filterColumn + filterValue CSVs by index, plus search/date/sort/page.
// Keep values keyed by field.key; only call toFilterParams at the URL/HTTP boundary.

import {
  fromFilterParams,
  toFilterParams,
  trackShipmentsFilterConfig,
  type FilterState,
} from '@aies/aies-models';

const state: FilterState = {
  search: 'SFN-1042',
  date: 'created_at',
  from: '2026-01-01',
  to: '2026-01-31',
  order: 'desc',
  page: 1,
  size: 20,
  values: {
    payment_status: 'paid',
    shipment_status: 'pending',
    tracking_number: 'TN-9',
  },
};

const params = toFilterParams(state, trackShipmentsFilterConfig);
// → {
//   search: 'SFN-1042',
//   date: 'created_at',
//   from: '2026-01-01',
//   to: '2026-01-31',
//   order: 'desc',
//   page: 1,
//   size: 20,
//   filterColumn: 'payment_status,shipment_status,tracking_number',
//   filterValue: 'paid,pending,TN-9',
// }

// Cold load from router queryParams:
const restored = fromFilterParams(params, trackShipmentsFilterConfig);
// restored.values.payment_status === 'paid'
`;

export /**
 *
 */
const FILTERS_NAMED = `
// Newer endpoints: each filter is its own query key (no filterColumn CSVs).
// Same drawer + FilterState; different serialize.

import {
  shipmentTrackingItemFilterConfig,
  toFilterParams,
  type FilterState,
} from '@aies/aies-models';

const state: FilterState = {
  search: 'AWB',
  values: { claim_status: 'open' },
};

toFilterParams(state, shipmentTrackingItemFilterConfig);
// → { search: 'AWB', claim_status: 'open' }
// (no filterColumn / filterValue)
`;

export /**
 *
 */
const FILTERS_ASYNC_OPTIONS = `
// Select fields declare optionsSource; you fetch the lists and pass optionLists.
// Keys must match field.key (warehouse_id, not warehouses).

import { inject } from '@angular/core';
import {
  FilterDrawerService,
  updateShipmentsFilterConfig,
} from '@aies/aies-ui';

export function openUpdateShipmentFilters(
  warehouses: { value: string; label: string }[],
  methods: { value: string; label: string }[],
  manifests: { value: string; label: string }[],
): void {
  inject(FilterDrawerService).open({
    config: updateShipmentsFilterConfig,
    optionLists: {
      warehouse_id: warehouses,
      shipment_method_id: methods,
      shipment_manifest_id: manifests,
    },
    onApply: ({ params }) => /* this.api.list(params) */ Promise.resolve(params),
  });
}
`;

export /**
 *
 */
const FILTERS_HYDRATE = `
// First paint: rebuild FilterState from queryParams so shared links restore filters.

import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  fromFilterParams,
  trackShipmentsFilterConfig,
  type FilterState,
} from '@aies/aies-models';
import { signal } from '@angular/core';

export class ListPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly state = signal<FilterState>(
    fromFilterParams(
      this.route.snapshot.queryParams,
      trackShipmentsFilterConfig,
    ),
  );
}
`;

/** @deprecated Prefer FILTERS_OPEN_APPLY — kept for older imports. */
export const FILTERS_OVERVIEW = FILTERS_OPEN_APPLY;
