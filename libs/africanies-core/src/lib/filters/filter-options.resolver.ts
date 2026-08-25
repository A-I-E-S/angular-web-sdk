import { inject, Injectable } from '@angular/core';

import { forkJoin, map, Observable, of } from 'rxjs';

import type {
  FilterFieldModel,
  FilterOptionsSource,
  ModuleFilterConfigModel,
} from '@africanies/africanies-models';

import { ShipmentMethodService } from '../shipment-method/shipment-method.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import {
  collectResolvableSelectFields,
  type FilterOptionLists,
  type FilterSelectOption,
  mapShipmentMethodFilterOptions,
  mapWarehouseFilterOptions,
} from './filter-options.mapper';

/**
 * Built-in {@link FilterOptionsSource} keys wired to SDK catalog services.
 *
 * `shipmentManifests` has no built-in service yet — resolve to `[]` and pass
 * host `optionLists` for those field keys.
 */
const SDK_FILTER_OPTIONS_SOURCES = new Set<FilterOptionsSource>([
  'warehouses',
  'shipmentMethods',
]);

/**
 * Resolves filter drawer select options from built-in SDK catalog services.
 *
 * Prefer opening {@link FilterDrawerService} immediately — the drawer lazy-loads
 * per field via {@link resolveField}. {@link resolve} remains for bulk prefetch.
 *
 * @example
 * ```ts
 * const resolver = inject(FilterOptionsResolver);
 *
 * filterDrawer.open({
 *   config: updateShipmentsFilterConfig,
 *   optionLists: { shipment_manifest_id: hostManifests },
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FilterOptionsResolver {
  private readonly warehouses = inject(WarehouseService);
  private readonly shipmentMethods = inject(ShipmentMethodService);

  /**
   * Resolve SDK-backed options for one select field (lazy drawer load).
   *
   * @param field - Filter schema field with `optionsSource`.
   * @returns Select rows or an error when the catalog HTTP call fails.
   */
  resolveField(field: FilterFieldModel): Observable<FilterSelectOption[]> {
    if (
      field.type !== 'select' ||
      field.optionsSource == null ||
      field.optionsSource === 'static'
    ) {
      return of(this.staticFieldOptions(field));
    }
    if (!SDK_FILTER_OPTIONS_SOURCES.has(field.optionsSource)) {
      return of([]);
    }
    return this.fetchSource(field.optionsSource);
  }

  /**
   * Resolve all SDK-backed select options for a module config (bulk prefetch).
   *
   * @param config - Module filter schema.
   * @returns `optionLists` keyed by field.key.
   */
  resolve(config: ModuleFilterConfigModel): Observable<FilterOptionLists> {
    const fields = collectResolvableSelectFields(config);
    if (fields.length === 0) {
      return of({});
    }

    const fetched = new Set<FilterOptionsSource>();
    const fetches: Record<string, Observable<FilterOptionLists>> = {};

    for (const field of fields) {
      const source = field.optionsSource;
      if (!SDK_FILTER_OPTIONS_SOURCES.has(source) || fetched.has(source)) {
        continue;
      }
      fetched.add(source);
      fetches[source] = this.fetchSource(source).pipe(
        map((options) => {
          const lists: FilterOptionLists = {};
          for (const f of fields) {
            if (f.optionsSource === source) {
              lists[f.key] = options;
            }
          }
          return lists;
        }),
      );
    }

    const keys = Object.keys(fetches) as FilterOptionsSource[];
    if (keys.length === 0) {
      return of({});
    }

    return forkJoin(
      keys.reduce(
        (acc, key) => {
          acc[key] = fetches[key]!;
          return acc;
        },
        {} as Record<FilterOptionsSource, Observable<FilterOptionLists>>,
      ),
    ).pipe(
      map((parts) =>
        keys.reduce<FilterOptionLists>((merged, key) => {
          Object.assign(merged, parts[key]);
          return merged;
        }, {}),
      ),
    );
  }

  private staticFieldOptions(field: FilterFieldModel): FilterSelectOption[] {
    return (field.options ?? []).map((o) => ({
      value: o.value,
      label: o.label,
    }));
  }

  private fetchSource(
    source: FilterOptionsSource,
  ): Observable<FilterSelectOption[]> {
    switch (source) {
      case 'warehouses':
        return this.warehouses.readAll().pipe(
          map((res) =>
            res.success ? mapWarehouseFilterOptions(res.data) : [],
          ),
        );
      case 'shipmentMethods':
        return this.shipmentMethods.readAll().pipe(
          map((res) =>
            res.success ? mapShipmentMethodFilterOptions(res.data) : [],
          ),
        );
      default:
        return of([]);
    }
  }
}
