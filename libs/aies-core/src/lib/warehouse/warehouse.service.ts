import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ResourceId,
  WarehouseModel,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from '../http/resource-path';
import {
  mapWarehouse,
  mapWarehouseList,
  WAREHOUSE_READ_PATH,
} from './warehouse.mapper';

/** In-memory GET cache TTL for warehouse reference dumps / by-id (5 minutes). */
const WAREHOUSE_CACHE_TTL_MS = 5 * 60_000;

/**
 * Warehouse utility reads (`GET /warehouse/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link WarehouseModel}
 *
 * @example
 * ```ts
 * const warehouses = inject(WarehouseService);
 *
 * warehouses.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * warehouses.readAll().subscribe((res) => console.log(res.data?.length));
 * warehouses.readById(37).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly api = inject(ApiClient);

  /** Paginated warehouse page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>>;

  /** Full warehouse list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>>;

  /** Single warehouse — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel | WarehouseModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(WAREHOUSE_READ_PATH, id), {
        toast: false,
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, WAREHOUSE_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(
            id,
            res.data,
            mapWarehouse,
            mapWarehouseList,
          ),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single record — alias for {@link read}(id).
   * @param id
   * @param params
   */
  readById(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<WarehouseModel>> {
    return this.read(id, params);
  }
}
