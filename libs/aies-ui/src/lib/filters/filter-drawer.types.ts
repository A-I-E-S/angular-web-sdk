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
