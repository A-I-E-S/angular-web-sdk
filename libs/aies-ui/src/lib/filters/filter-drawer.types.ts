import type { Observable } from 'rxjs';

import type {
  FilterParamsModel,
  FilterStateModel,
  ModuleFilterConfigModel,
} from '@aies/aies-models';

/**
 * Payload injected into {@link FilterDrawerPanel} via {@link OVERLAY_DATA}.
 */
export interface FilterDrawerData {
  /** Module schema that drives the drawer UI. */
  config: ModuleFilterConfigModel;
  /** Current filter state (cloned inside the panel for editing). */
  state?: FilterStateModel | null;
  /**
   * Host-resolved option lists keyed by {@link FilterFieldModel.key}
   * (for `optionsSource` selects such as manifests without a built-in SDK service).
   *
   * SDK catalogs (`warehouses`, `shipmentMethods`) load lazily inside the drawer
   * when the user adds the field via Filter by — no prefetch required.
   */
  optionLists?: Record<string, { value: string; label: string }[]>;
  /** Drawer title override (defaults to “Filters”). */
  title?: string;
  /**
   * Optional async apply hook (list refetch, etc.).
   *
   * When provided, Apply waits until the Observable/Promise completes
   * **successfully**, then closes the drawer and writes the query bag to the
   * URL. Errors leave the drawer open so the user can fix filters and retry.
   * Omit for sync close (playground / local-only state updates).
   *
   * @param draft - Pending state + serialized params (not yet committed by the host).
   */
  onApply?: (
    draft: { state: FilterStateModel; params: FilterParamsModel },
  ) => Observable<unknown> | Promise<unknown> | void;
}

/**
 * Result emitted when the user applies filters.
 * Cancel / backdrop dismiss yields `undefined` from `afterClosed`.
 */
export interface FilterDrawerResult {
  applied: true;
  /** Edited map state after Apply. */
  state: FilterStateModel;
  /** Serialized query / API bag for the active transport. */
  params: FilterParamsModel;
}
