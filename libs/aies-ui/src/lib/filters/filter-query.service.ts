import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, type ParamMap, Router } from '@angular/router';

import {
  type FilterQueryBag,
  filterQueryKeys,
  type FilterStateModel,
  fromFilterParams,
  hasFilterParams,
  type ModuleFilterConfigModel,
  toFilterParams,
} from '@aies/aies-models';

/**
 * Bidirectional list-query sync with the browser URL.
 *
 * - {@link read} / {@link hasParams} hydrate {@link FilterStateModel} when
 *   `page`, `size`, or filter keys are present.
 * - {@link write} replaces those keys on Apply (keeps overlay / unrelated params).
 * - {@link setPage} / {@link setSize} merge pagination keys (size change resets
 *   `page` to 1).
 *
 * No-ops when Angular Router is not in the injector (unit tests without
 * `provideRouter`).
 */
@Injectable({ providedIn: 'root' })
export class FilterQueryService {
  private readonly route = inject(ActivatedRoute, { optional: true });
  private readonly router = inject(Router, { optional: true });

  /**
   * True when the current URL has any filter / pagination query this config
   * understands.
   *
   * @param config - Module schema (param names + transport).
   * @returns Whether the URL should seed filter / pager state.
   */
  hasParams(config: ModuleFilterConfigModel): boolean {
    return hasFilterParams(this.snapshotBag(), config);
  }

  /**
   * Rebuild filter state from the current URL.
   *
   * Missing keys yield {@link emptyFilterState} defaults (no `page` / `size`
   * unless present).
   *
   * @param config - Module schema.
   * @returns Hydrated state.
   */
  read(config: ModuleFilterConfigModel): FilterStateModel {
    return fromFilterParams(this.snapshotBag(), config);
  }

  /**
   * Write the serialized filter bag to the URL.
   *
   * Drops previous keys from this config so cleared filters disappear, then
   * sets the new bag. Sibling params (`modal`, `drawer`, …) are kept.
   *
   * @param state - Committed filter state (include `page` / `size`).
   * @param config - Module schema.
   * @returns Router navigation result, or `false` when Router is unavailable.
   */
  write(
    state: FilterStateModel,
    config: ModuleFilterConfigModel,
  ): Promise<boolean> {
    if (!this.router || !this.route) {
      return Promise.resolve(false);
    }
    const next: Record<string, string | number | null> = {
      ...this.snapshotRecord(),
    };
    for (const key of filterQueryKeys(config)) {
      delete next[key];
    }
    const params = toFilterParams(state, config);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        next[key] = value;
      }
    }
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: next,
      queryParamsHandling: '',
    });
  }

  /**
   * Merge `page` into the current query string.
   *
   * @param page - 1-based page index.
   * @param config - Optional schema; defaults to the `page` query key.
   * @returns Router navigation result, or `false` when Router is unavailable.
   */
  setPage(page: number, config?: ModuleFilterConfigModel): Promise<boolean> {
    const pageKey = config?.pagination?.pageParam ?? 'page';
    return this.mergeQuery({ [pageKey]: page });
  }

  /**
   * Merge `size` and reset `page` to 1.
   *
   * @param size - Page size.
   * @param config - Optional schema; defaults to `page` / `size` query keys.
   * @returns Router navigation result, or `false` when Router is unavailable.
   */
  setSize(size: number, config?: ModuleFilterConfigModel): Promise<boolean> {
    const pageKey = config?.pagination?.pageParam ?? 'page';
    const sizeKey = config?.pagination?.sizeParam ?? 'size';
    return this.mergeQuery({ [pageKey]: 1, [sizeKey]: size });
  }

  private mergeQuery(
    queryParams: Record<string, string | number>,
  ): Promise<boolean> {
    if (!this.router || !this.route) {
      return Promise.resolve(false);
    }
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private snapshotBag(): FilterQueryBag {
    return this.snapshotRecord();
  }

  private snapshotRecord(): Record<string, string> {
    const map = this.route?.snapshot.queryParamMap;
    if (!map) {
      return {};
    }
    return paramMapToRecord(map);
  }
}

/**
 * Flatten a {@link ParamMap} to a single-value record (first value wins).
 *
 * @param map - Angular query / matrix param map.
 * @returns Plain string dictionary.
 */
export function paramMapToRecord(map: ParamMap): Record<string, string> {
  const record: Record<string, string> = {};
  for (const key of map.keys) {
    const value = map.get(key);
    if (value != null && value !== '') {
      record[key] = value;
    }
  }
  return record;
}
