import type { WritableSignal } from '@angular/core';

import {
  emptyFilterState,
  type FilterStateModel,
  type ModuleFilterConfigModel,
} from '@africanies/africanies-models';

import type { FilterQueryService } from './filter-query.service';

/**
 * Clears applied list filters (search / dates / fields), keeps page size,
 * resets to page 1, and syncs the URL via {@link FilterQueryService.write}.
 * Hosts that listen to `queryParamMap` will refetch from the cleared state.
 */
export function clearAppliedListFilters(options: {
  filterQuery: FilterQueryService;
  config: ModuleFilterConfigModel;
  filterState: WritableSignal<FilterStateModel>;
}): void {
  const current = options.filterState();
  const next = emptyFilterState();
  if (current.size != null) {
    next.size = current.size;
  }
  next.page = 1;
  options.filterState.set(next);
  void options.filterQuery.write(next, options.config);
}
