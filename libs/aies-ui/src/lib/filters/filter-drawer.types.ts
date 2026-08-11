import type { Observable } from 'rxjs';

import type {
  FilterParams,
  FilterState,
  ModuleFilterConfig,
} from '@aies/aies-models';

/**
 * Payload injected into {@link FilterDrawerPanel} via {@link OVERLAY_DATA}.
 */
export interface FilterDrawerData {
  /** Module schema that drives the drawer UI. */
  config: ModuleFilterConfig;
  /** Current filter state (cloned inside the panel for editing). */
  state?: FilterState | null;
  /**
   * Host-resolved option lists keyed by {@link FilterField.key}
   * (for `optionsSource` selects such as warehouses).
   */
  optionLists?: Record<string, { value: string; label: string }[]>;
  /** Drawer title override (defaults to “Filters”). */
  title?: string;
  /**
   * Optional async apply hook (list refetch, etc.).
   *
   * When provided, Apply waits until the Observable/Promise completes
   * **successfully**, then closes the drawer. Errors leave the drawer open
   * so the user can fix filters and retry. Omit for sync close (playground /
   * local-only state updates).
   *
   * @param draft - Pending state + serialized params (not yet committed by the host).
   */
  onApply?: (
    draft: { state: FilterState; params: FilterParams },
  ) => Observable<unknown> | Promise<unknown> | void;
}

/**
 * Result emitted when the user applies filters.
 * Cancel / backdrop dismiss yields `undefined` from `afterClosed`.
 */
export interface FilterDrawerResult {
  applied: true;
  /** Edited map state after Apply. */
  state: FilterState;
  /** Serialized query / API bag for the active transport. */
  params: FilterParams;
}
