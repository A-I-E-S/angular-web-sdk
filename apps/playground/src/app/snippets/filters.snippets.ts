/**
 * Playground implementation snippets — schema-driven filters (full examples).
 */

export /**
 * Open the drawer, await list refetch, then commit state.
 */
const FILTERS_OPEN_APPLY = `
// =============================================================================
// GUIDE — Open drawer + onApply
//
// INTENT
//   One shared drawer for every list module. Host owns FilterState; the drawer
//   edits a clone and only commits when Apply succeeds.
//
// PREREQUISITES
//   provideAiesUiOverlays() in app.config (registers FilterDrawerService).
//
// DO
//   - Pass onApply: ({ params }) => this.api.loadList(params) so the drawer
//     stays open until the HTTP call succeeds (errors keep it open + show a tip).
//   - After afterClosed with applied=true, save result.state (and sync the URL).
//
// DON'T
//   - Close the drawer yourself on Apply — onApply owns that.
//   - Mutate host state before afterClosed; the drawer works on a clone.
// =============================================================================

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
        // Drawer shows “Applying…” and closes only when this completes.
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
 * Full ModuleFilterConfig — every common field type.
 */
const FILTERS_AUTHOR_CONFIG = `
// =============================================================================
// GUIDE — Author a ModuleFilterConfig
//
// INTENT
//   The drawer UI is 100% driven by this schema. Field \`type\` picks the control;
//   \`transport\` picks how toFilterParams flattens values for the API/URL.
//
// FIELD TYPES
//   enum     — colored chips (optional color hex; UI-only)
//   text     — free text input
//   select   — aies-select; static options or host optionLists via optionsSource
//   boolean  — Yes/No radio mapped to API scalars (often '1' / '0')
//
// SHARED BLOCKS
//   search / date / sort / pagination — rendered above “Filter by” when present
// =============================================================================

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
 * Enum chips with optional color.
 */
const FILTERS_ENUM_COLORS = `
// =============================================================================
// GUIDE — Enum chips + color
//
// INTENT
//   Status filters render as chips. Optional \`color\` tints the selected chip
//   (text, border, light fill). Idle chips stay neutral.
//
// IMPORTANT
//   color is UI-only — toFilterParams never sends it. Reuse the same hex when
//   the same status meaning appears in multiple modules (pending yellow, etc.).
// =============================================================================

{
  key: 'shipment_status',
  label: 'Shipment Status',
  type: 'enum',
  exclusive: true, // one value at a time for this key (default intent for chips)
  options: [
    { value: 'pending', label: 'Pending', color: '#DBB316' },
    { value: 'in-process', label: 'In Process', color: '#3B82F6' },
    { value: 'completed', label: 'Completed', color: '#25945c' },
  ],
}
`;

export /**
 * Filter by multi-select sections.
 */
const FILTERS_FILTER_BY = `
// =============================================================================
// GUIDE — Filter by (multi-select)
//
// INTENT
//   The drawer’s “Filter by” control lists every config.fields entry. Choosing
//   a field reveals its control below. Deselecting removes that section and
//   clears its value on Apply.
//
// DO
//   - Use stable field.key values — they become filterColumn names (legacy)
//     or query keys (named).
// =============================================================================

// User picks “Payment Status” + “Warehouse” in Filter by →
// draft.values = { payment_status: 'paid', warehouse_id: '12' }
`;

export /**
 * Date range + Clear + To min.
 */
const FILTERS_DATE_RANGE = `
// =============================================================================
// GUIDE — Date range
//
// INTENT
//   When config.date is set, the drawer shows:
//     1) which date column (date field select)
//     2) From / To pickers
//     3) Clear — resets date + from + to only (other filters stay)
//
// BEHAVIOR
//   To cannot be before From — the To picker gets [min]=From, and moving From
//   past To clears To automatically.
//
// SERIALIZE
//   from / to / date query params (names from rangeParams + fieldParam)
// =============================================================================

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
 * legacy-parallel serialize round-trip.
 */
const FILTERS_LEGACY = `
// =============================================================================
// GUIDE — legacy-parallel transport
//
// INTENT
//   Match existing Laravel list endpoints: filterColumn + filterValue CSVs
//   aligned by index, plus search / from / to / date / order / page / size.
//
// DO
//   - Keep an internal values map keyed by field.key.
//   - Only call toFilterParams at the URL / HTTP boundary.
//   - Use fromFilterParams on cold load to rebuild the map from the query string.
// =============================================================================

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
 * named transport.
 */
const FILTERS_NAMED = `
// =============================================================================
// GUIDE — named transport
//
// INTENT
//   Newer endpoints expose each filter as its own query key (claim_status, …)
//   instead of parallel CSVs. Same drawer + FilterState; different serialize.
// =============================================================================

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
 * Async option catalogs.
 */
const FILTERS_ASYNC_OPTIONS = `
// =============================================================================
// GUIDE — async option catalogs
//
// INTENT
//   Select fields declare optionsSource ('warehouses', 'shipmentMethods', …).
//   The SDK does not fetch them — the host resolves lists and passes optionLists
//   keyed by the same field.key as in ModuleFilterConfig.
//
// DO
//   - Match optionLists keys to field.key exactly (warehouse_id, not warehouses).
//   - Static selects use optionsSource: 'static' + inline options[] instead.
// =============================================================================

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
 * Hydrate from URL on cold load.
 */
const FILTERS_HYDRATE = `
// =============================================================================
// GUIDE — Cold load from URL
//
// INTENT
//   On first paint, rebuild FilterState from router queryParams so shared links
//   and back/forward restore the same filters the API last used.
// =============================================================================

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
