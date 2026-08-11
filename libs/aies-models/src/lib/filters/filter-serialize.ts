import type {
  FilterParams,
  FilterState,
  ModuleFilterConfig,
} from './filter-config.model';

/**
 * Empty filter state — safe default before hydrate / after reset.
 *
 * @returns A state with an empty `values` map.
 */
export function emptyFilterState(): FilterState {
  return { values: {} };
}

/**
 * Clone state so drawer edits do not mutate the host until Apply.
 *
 * @param state - Current filter state (or undefined).
 * @returns A shallow copy safe to mutate in the drawer.
 */
export function cloneFilterState(state?: FilterState | null): FilterState {
  if (state == null) {
    return emptyFilterState();
  }
  return {
    search: state.search,
    from: state.from,
    to: state.to,
    date: state.date,
    order: state.order,
    page: state.page,
    size: state.size,
    values: { ...state.values },
  };
}

/**
 * Serialize {@link FilterState} for URL query strings and list API calls.
 *
 * - `legacy-parallel`: emits `filterColumn` / `filterValue` as aligned CSV.
 * - `named`: each selected field key is its own query param.
 *
 * Empty strings and undefined field values are omitted.
 *
 * @param state - Current filter map state.
 * @param config - Module schema (controls transport + shared params).
 * @returns Flat query / API bag ready for HttpParams or the router.
 */
export function toFilterParams(
  state: FilterState,
  config: ModuleFilterConfig,
): FilterParams {
  const params: FilterParams = {};

  if (state.search != null && state.search !== '') {
    params[config.search?.param ?? 'search'] = state.search;
  }
  if (state.from) {
    params[config.date?.rangeParams.from ?? 'from'] = state.from;
  }
  if (state.to) {
    params[config.date?.rangeParams.to ?? 'to'] = state.to;
  }
  if (state.date) {
    params[config.date?.fieldParam ?? 'date'] = state.date;
  }
  if (state.order) {
    params[config.sort?.param ?? 'order'] = state.order;
  }
  if (state.page != null) {
    params[config.pagination?.pageParam ?? 'page'] = state.page;
  }
  if (state.size != null) {
    params[config.pagination?.sizeParam ?? 'size'] = state.size;
  }

  if (config.transport === 'named') {
    for (const field of config.fields) {
      const v = state.values[field.key];
      if (v != null && v !== '') {
        params[field.key] = v;
      }
    }
    return params;
  }

  // legacy-parallel — only fields that have a value
  const columns: string[] = [];
  const values: string[] = [];
  for (const field of config.fields) {
    const v = state.values[field.key];
    if (v === undefined || v === '') {
      continue;
    }
    columns.push(field.key);
    values.push(String(v));
  }
  if (columns.length) {
    params['filterColumn'] = columns.join(',');
    params['filterValue'] = values.join(',');
  }

  return params;
}

/**
 * Hydrate {@link FilterState} from a flat query / API bag.
 *
 * For `legacy-parallel`, zips `filterColumn` + `filterValue` CSV pairs.
 * Unknown column keys are still restored into `values` so round-trips survive
 * config drift.
 *
 * @param params - Router query params or API query object (stringish values).
 * @param config - Module schema.
 * @returns Hydrated {@link FilterState}.
 */
export function fromFilterParams(
  params: Record<string, string | number | null | undefined | readonly string[]>,
  config: ModuleFilterConfig,
): FilterState {
  const state = emptyFilterState();

  const read = (key: string): string | undefined => {
    const raw = params[key];
    if (raw == null) {
      return undefined;
    }
    if (Array.isArray(raw)) {
      return raw[0] != null ? String(raw[0]) : undefined;
    }
    const s = String(raw);
    return s === '' ? undefined : s;
  };

  state.search = read(config.search?.param ?? 'search');
  state.from = read(config.date?.rangeParams.from ?? 'from');
  state.to = read(config.date?.rangeParams.to ?? 'to');
  state.date = read(config.date?.fieldParam ?? 'date');
  state.order = read(config.sort?.param ?? 'order');

  const pageRaw = read(config.pagination?.pageParam ?? 'page');
  const sizeRaw = read(config.pagination?.sizeParam ?? 'size');
  if (pageRaw != null) {
    const n = Number(pageRaw);
    if (!Number.isNaN(n)) {
      state.page = n;
    }
  }
  if (sizeRaw != null) {
    const n = Number(sizeRaw);
    if (!Number.isNaN(n)) {
      state.size = n;
    }
  }

  if (config.transport === 'named') {
    for (const field of config.fields) {
      const v = read(field.key);
      if (v != null) {
        state.values[field.key] = v;
      }
    }
    return state;
  }

  const columns = (read('filterColumn') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const values = (read('filterValue') ?? '')
    .split(',')
    .map((s) => s.trim());

  columns.forEach((key, i) => {
    const v = values[i];
    if (v != null && v !== '') {
      state.values[key] = v;
    }
  });

  return state;
}

/**
 * Drop one field value (column deselected / section clear).
 *
 * @param state - Mutable or immutable state to copy.
 * @param key - {@link FilterField.key} to clear.
 * @returns Cloned state without that field value.
 */
export function clearFilterField(
  state: FilterState,
  key: string,
): FilterState {
  const next = cloneFilterState(state);
  delete next.values[key];
  return next;
}

/**
 * Reset to empty values while optionally keeping pagination.
 *
 * @param keepPagination - When true, preserve `page` / `size`.
 * @param state - Optional prior state for pagination retention.
 * @returns Empty filter state, optionally retaining pagination.
 */
export function resetFilterState(
  keepPagination = false,
  state?: FilterState | null,
): FilterState {
  const next = emptyFilterState();
  if (keepPagination && state) {
    next.page = state.page;
    next.size = state.size;
  }
  return next;
}
