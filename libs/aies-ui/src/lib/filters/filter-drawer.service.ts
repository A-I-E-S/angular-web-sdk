import { inject, Injectable } from '@angular/core';

import type { OverlayHandle } from '@aies/aies-core';

import { DrawerService } from '../overlay/drawer.service';
import { FilterDrawerPanel } from './filter-drawer.panel';
import type {
  FilterDrawerData,
  FilterDrawerResult,
} from './filter-drawer.types';
import { FilterQueryService } from './filter-query.service';

/**
 * Opens the schema-driven {@link FilterDrawerPanel} via {@link DrawerService}.
 *
 * Requires {@link provideAiesUiOverlays} at bootstrap (same as other overlays).
 *
 * When the current URL already has filter / pagination query params for the
 * given config, those values seed the drawer (overriding a stale host `state`).
 * Successful Apply writes the bag back through {@link FilterQueryService}.
 *
 * @example
 * ```ts
 * const filters = inject(FilterDrawerService);
 * const query = inject(FilterQueryService);
 * const config = trackShipmentsFilterConfig;
 * const state = signal(
 *   query.hasParams(config) ? query.read(config) : emptyFilterState(),
 * );
 *
 * filters
 *   .open({
 *     config,
 *     state: state(),
 *     onApply: ({ params }) => this.shipments.load(params),
 *   })
 *   .afterClosed()
 *   .subscribe((result) => {
 *     if (result?.applied) {
 *       this.state.set(result.state);
 *     }
 *   });
 * ```
 */
@Injectable()
export class FilterDrawerService {
  private readonly drawer = inject(DrawerService);
  private readonly filterQuery = inject(FilterQueryService);

  /**
   * Opens the filter drawer (dismissible by default — backdrop / Escape cancel).
   *
   * Pass {@link FilterDrawerData.onApply} to keep the drawer open until your
   * API call succeeds; omit it to close immediately on Apply.
   *
   * @param data - Module config, optional prior state, and host option lists.
   * @returns Overlay handle; `afterClosed` emits {@link FilterDrawerResult} on Apply.
   */
  open(data: FilterDrawerData): OverlayHandle<FilterDrawerResult> {
    const payload = this.filterQuery.hasParams(data.config)
      ? { ...data, state: this.filterQuery.read(data.config) }
      : data;
    return this.drawer.open<FilterDrawerData, FilterDrawerResult>(
      FilterDrawerPanel,
      { data: payload, dismissible: true },
    );
  }
}
