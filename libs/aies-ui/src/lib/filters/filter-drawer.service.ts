import type { OverlayHandle } from '@aies/aies-core';
import { inject, Injectable } from '@angular/core';

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
 *   .open({ config: trackShipmentsFilterConfig, state: current })
 *   .afterClosed()
 *   .subscribe((result) => {
 *     if (result?.applied) {
 *       applyQuery(result.params);
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
