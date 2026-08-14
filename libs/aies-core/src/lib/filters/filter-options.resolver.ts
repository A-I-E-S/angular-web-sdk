import { inject, Injectable } from '@angular/core';

import { forkJoin, map, Observable, of } from 'rxjs';

import type {
  FilterOptionsSource,
  ModuleFilterConfigModel,
} from '@aies/aies-models';

import { ShipmentMethodService } from '../shipment-method/shipment-method.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import {
  collectResolvableSelectFields,
  type FilterOptionLists,
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
 * Walks {@link ModuleFilterConfigModel.fields}, fetches each distinct
 * `optionsSource` once, and returns `optionLists` keyed by **field.key**
 * (what {@link FilterDrawerService} expects).
 *
 * @example
 * ```ts
 * const resolver = inject(FilterOptionsResolver);
 *
 * resolver.resolve(updateShipmentsFilterConfig).subscribe((lists) => {
 *   filterDrawer.open({
 *     config: updateShipmentsFilterConfig,
 *     optionLists: mergeFilterOptionLists(lists, {
 *       shipment_manifest_id: hostManifests,
 *     }),
 *   });
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FilterOptionsResolver {
  private readonly warehouses = inject(WarehouseService);
  private readonly shipmentMethods = inject(ShipmentMethodService);

  /**
   * Resolve all SDK-backed select options for a module config.
   *
   * Uses {@link WarehouseService.readAll} for `warehouses` and
   * {@link ShipmentMethodService.readAll} for `shipmentMethods`.
   * Unknown or unmapped sources are omitted (host must supply via merge).
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

  private fetchSource(
    source: FilterOptionsSource,
  ): Observable<ReturnType<typeof mapWarehouseFilterOptions>> {
    switch (source) {
      case 'warehouses':
        return this.warehouses.readAll().pipe(
          map((res) =>
            res.success && res.data ? mapWarehouseFilterOptions(res.data) : [],
          ),
        );
      case 'shipmentMethods':
        return this.shipmentMethods.readAll().pipe(
          map((res) =>
            res.success && res.data
              ? mapShipmentMethodFilterOptions(res.data)
              : [],
          ),
        );
      default:
        return of([]);
    }
  }
}
