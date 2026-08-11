import { inject, Injectable } from '@angular/core';

import type { OverlayHandle } from '@aies/aies-core';

import { DrawerService } from '../overlay/drawer.service';
import { FilterDrawerPanel } from './filter-drawer.panel';
import type {
  FilterDrawerData,
  FilterDrawerResult,
} from './filter-drawer.types';

/**
 * Opens the schema-driven {@link FilterDrawerPanel} via {@link DrawerService}.
 *
 * Requires {@link provideAiesUiOverlays} at bootstrap (same as other overlays).
 *
 * @example
 * ```ts
 * const filters = inject(FilterDrawerService);
 * filters
 *   .open({
 *     config: trackShipmentsFilterConfig,
 *     state: current,
 *     // Drawer stays open until the list request succeeds.
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
    return this.drawer.open<FilterDrawerData, FilterDrawerResult>(
      FilterDrawerPanel,
      { data, dismissible: true },
    );
  }
}
