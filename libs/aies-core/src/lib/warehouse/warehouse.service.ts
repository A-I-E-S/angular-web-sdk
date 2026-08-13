import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type { ApiResponseModel, WarehouseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  mapWarehouseList,
  WAREHOUSE_READ_PATH,
} from './warehouse.mapper';

/** Optional query string for warehouse reads (null/undefined omitted). */
export type WarehouseReadParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/** In-memory GET cache TTL for warehouse reference data (5 minutes). */
const WAREHOUSE_CACHE_TTL_MS = 5 * 60_000;

/**
 * Warehouse utility reads (`GET /warehouse/read/{id|all}`).
 *
 * Default id is `'all'`. Response `data` is always mapped to
 * {@link WarehouseModel}[] (snake_case wire fields become camelCase;
 * nested `country` reuses the country mapper).
 *
 * @example
 * ```ts
 * const warehouses = inject(WarehouseService);
 *
 * warehouses.read().subscribe((res) => {
 *   if (res.success) console.log(res.data?.[0]?.name);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly api = inject(ApiClient);

  /**
   * Fetch warehouses for `id` (defaults to `'all'`).
   *
   * @param id - Numeric warehouse id or `'all'`.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link WarehouseModel}[].
   */
  read(
    id: number | 'all' = 'all',
    params?: WarehouseReadParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>> {
    const path = `${WAREHOUSE_READ_PATH}/${id}`;
    return this.api
      .get<unknown>(path, {
        params,
        cacheTtlMs: WAREHOUSE_CACHE_TTL_MS,
      })
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapWarehouseList(res.data),
        })),
      );
  }

  /**
   * Full warehouse list — alias for {@link read}(`'all'`).
   *
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link WarehouseModel}[].
   */
  readAll(
    params?: WarehouseReadParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single-warehouse read by numeric id (still returns a one-element array).
   *
   * @param id - Warehouse id.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link WarehouseModel}[].
   */
  readById(
    id: number,
    params?: WarehouseReadParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>> {
    return this.read(id, params);
  }
}
