/**
 * Playground implementation snippets — schema-driven filters.
 */

export const FILTERS_OVERVIEW = `
// =============================================================================
// ARCHITECT GUIDE — List filters
//
// INTENT
//   Uniform filter protocol across modules: ModuleFilterConfig drives a shared
//   drawer; FilterState stays as a values map; serialize only at the API/URL edge.
//
// PREREQUISITES
//   provideAiesUiOverlays() in app.config (registers FilterDrawerService).
//   @aies/aies-models filter types (re-exported from @aies/aies-ui for convenience).
//
// DO
//   - Declare one ModuleFilterConfig per module (fields + search/date/sort).
//   - Keep UI state as FilterState.values[fieldKey].
//   - Use toFilterParams / fromFilterParams for URL + HTTP.
//   - Pass optionLists for async catalogs (warehouses, carriers).
//
// DON'T
//   - Copy drawer HTML per module.
//   - Build filterColumn/filterValue with fragile group string joins — use the map.
// =============================================================================

import { Component, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  FilterDrawerService,
  emptyFilterState,
  fromFilterParams,
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
    <pre>{{ paramsJson() }}</pre>
  \`,
})
export class ShipmentListFiltersComponent {
  private readonly filterDrawer = inject(FilterDrawerService);

  protected readonly state = signal<FilterState>(emptyFilterState());

  protected paramsJson = () =>
    JSON.stringify(
      toFilterParams(this.state(), trackShipmentsFilterConfig),
      null,
      2,
    );

  protected openFilters(): void {
    this.filterDrawer
      .open({
        config: trackShipmentsFilterConfig,
        state: this.state(),
        title: 'Track shipments',
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result?.applied) {
          return;
        }
        this.state.set(result.state);
        // router.navigate([], { queryParams: result.params })
        // refetch list with result.params
      });
  }

  /** Cold load from URL */
  protected hydrate(query: Record<string, string>): void {
    this.state.set(fromFilterParams(query, trackShipmentsFilterConfig));
  }
}
`;

export const FILTERS_LEGACY = `
// =============================================================================
// ARCHITECT GUIDE — legacy-parallel transport
//
// INTENT
//   Match existing Laravel list endpoints: filterColumn + filterValue CSVs
//   aligned by position, plus search / from / to / date / order / page / size.
//
// DO
//   - Set transport: 'legacy-parallel' on ModuleFilterConfig.
//   - Only fields with values are included in the CSV (no trailing empties).
// =============================================================================

import {
  toFilterParams,
  type FilterState,
  type ModuleFilterConfig,
} from '@aies/aies-models';

const config: ModuleFilterConfig = {
  id: 'demo',
  transport: 'legacy-parallel',
  fields: [
    { key: 'payment_status', label: 'Payment', type: 'enum',
      options: [{ value: 'paid', label: 'Paid' }] },
    { key: 'warehouse_id', label: 'Warehouse', type: 'select',
      optionsSource: 'warehouses' },
  ],
};

const state: FilterState = {
  search: 'SFN-1042',
  values: { payment_status: 'paid', warehouse_id: '12' },
};

toFilterParams(state, config);
// → {
//   search: 'SFN-1042',
//   filterColumn: 'payment_status,warehouse_id',
//   filterValue: 'paid,12',
// }
`;

export const FILTERS_NAMED = `
// =============================================================================
// ARCHITECT GUIDE — named transport
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

export const FILTERS_ASYNC_OPTIONS = `
// =============================================================================
// ARCHITECT GUIDE — async option catalogs
//
// INTENT
//   Select fields declare optionsSource ('warehouses', 'shipmentMethods', …).
//   The host resolves lists and passes them as optionLists into the drawer.
// =============================================================================

import { inject } from '@angular/core';
import {
  FilterDrawerService,
  updateShipmentsFilterConfig,
} from '@aies/aies-ui';

export function openUpdateShipmentFilters(
  warehouses: { value: string; label: string }[],
  methods: { value: string; label: string }[],
): void {
  inject(FilterDrawerService).open({
    config: updateShipmentsFilterConfig,
    optionLists: {
      warehouse_id: warehouses,
      shipment_method_id: methods,
      // shipment_manifest_id: manifests,
    },
  });
}
`;
