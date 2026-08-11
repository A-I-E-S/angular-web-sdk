/**
 * Schema-driven list filter contracts for AIES modules.
 *
 * Modules declare a {@link ModuleFilterConfig}; the UI drawer renders from it
 * and {@link toFilterParams} / {@link fromFilterParams} speak to the API.
 */

/** How a filter field is rendered and validated in the drawer. */
export type FilterFieldType =
  /** Chip / single-select group — exclusive within the field by default. */
  | 'enum'
  /** Free-text scalar (tracking number, etc.). */
  | 'text'
  /** Static or host-resolved option list (warehouse, carrier, …). */
  | 'select'
  /** Yes/no mapped to API scalars (often `'1'` / `'0'`). */
  | 'boolean';

/**
 * Option row for enum / select / boolean fields.
 *
 * `color` is a UI hint only (chip styling) — never sent to the API.
 */
export interface FilterOption {
  /** Canonical value written into filter state / query params. */
  value: string;
  /** Visible label. */
  label: string;
  /** Optional chip / badge color (hex or CSS). */
  color?: string;
}

/**
 * Well-known async option catalogs resolved by the host app.
 * The SDK only names the source; the host passes resolved lists into the drawer.
 */
export type FilterOptionsSource =
  | 'shipmentMethods'
  | 'warehouses'
  | 'shipmentManifests'
  | 'static';

/**
 * One filterable API field inside a {@link ModuleFilterConfig}.
 */
export interface FilterField {
  /** API `filterColumn` name (e.g. `payment_status`). */
  key: string;
  /** Drawer section label. */
  label: string;
  /** Control kind. */
  type: FilterFieldType;
  /** Static options (enum / boolean / static select). */
  options?: FilterOption[];
  /**
   * When true (default for `enum`), selecting a value replaces any prior value
   * for this key — chip groups are mutually exclusive per field.
   */
  exclusive?: boolean;
  /** Host-resolved option catalog name for `select` fields. */
  optionsSource?: FilterOptionsSource;
  /** Placeholder for text / select triggers. */
  placeholder?: string;
}

/**
 * Module-level filter schema — the only per-module difference for list filters.
 *
 * @example
 * ```ts
 * const trackShipmentsFilterConfig: ModuleFilterConfig = {
 *   id: 'track-shipments',
 *   transport: 'legacy-parallel',
 *   fields: [
 *     { key: 'payment_status', label: 'Payment Status', type: 'enum', options: […] },
 *   ],
 * };
 * ```
 */
export interface ModuleFilterConfig {
  /** Stable module id (`track-shipments`, `users`, …). */
  id: string;
  /**
   * Optional portal route segments for docs / deep links
   * (e.g. `['portal', 'shipment', 'track-shipments']`).
   */
  route?: string[];
  /** Free-text search box. */
  search?: {
    param: 'search';
    label: string;
    placeholder?: string;
  };
  /** Date range + which date column the range applies to. */
  date?: {
    rangeParams: { from: 'from'; to: 'to' };
    fieldParam: 'date';
    fields: FilterOption[];
  };
  /** Sort direction control. */
  sort?: {
    param: 'order';
    options: FilterOption[];
  };
  /** Pagination query param names (defaults when omitted at serialize time). */
  pagination?: {
    pageParam: 'page';
    sizeParam: 'size';
  };
  /** Filterable fields rendered in the drawer. */
  fields: FilterField[];
  /**
   * Backend wire format:
   * - `legacy-parallel` — `filterColumn` + `filterValue` comma strings (Laravel lists)
   * - `named` — each field key is its own query param (newer endpoints)
   */
  transport: 'legacy-parallel' | 'named';
}

/**
 * Preferred UI / feature state for filters.
 *
 * Keep values as a map keyed by {@link FilterField.key}; only flatten to
 * parallel comma strings at the API / URL boundary.
 */
export interface FilterState {
  search?: string;
  /** Inclusive range start (`YYYY-MM-DD`). */
  from?: string;
  /** Inclusive range end (`YYYY-MM-DD`). */
  to?: string;
  /** Which date column `from`/`to` apply to (`created_at`, …). */
  date?: string;
  order?: 'asc' | 'desc' | string;
  page?: number;
  size?: number;
  /**
   * Field values keyed by {@link FilterField.key}.
   * Omit or set `undefined` / `''` to exclude from serialization.
   */
  values: Record<string, string | undefined>;
}

/**
 * Flat query / API bag produced by {@link toFilterParams}.
 * Values are strings (or numbers for page/size) ready for HttpParams / router.
 */
export type FilterParams = Record<string, string | number | undefined>;
