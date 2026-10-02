import { signal } from '@angular/core';

import type {
  FilterStateModel,
  ModuleFilterConfigModel,
} from '@africanies/africanies-models';

import { clearAppliedListFilters } from './clear-applied-list-filters';

describe('clearAppliedListFilters', () => {
  it('resets filters, keeps size, writes page 1', () => {
    const filterState = signal<FilterStateModel>({
      page: 3,
      size: 50,
      search: 'ada',
      values: { status: 'open' },
    });
    const writes: FilterStateModel[] = [];
    const filterQuery = {
      write: (state: FilterStateModel) => {
        writes.push(state);
        return Promise.resolve();
      },
    };
    const config = { id: 'test' } as ModuleFilterConfigModel;

    clearAppliedListFilters({
      filterQuery: filterQuery as never,
      config,
      filterState,
    });

    expect(filterState().page).toBe(1);
    expect(filterState().size).toBe(50);
    expect(filterState().search).toBeUndefined();
    expect(filterState().values).toEqual({});
    expect(writes).toHaveLength(1);
    expect(writes[0].page).toBe(1);
    expect(writes[0].size).toBe(50);
  });
});
