import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ResourceId,
  ShipmentMethodModel,
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
  mapShipmentMethod,
  mapShipmentMethodList,
  SHIPMENT_METHOD_READ_PATH,
} from './shipment-method.mapper';

/** Query bag for shipment-method reads (pagination only when `id` is `null`). */
export type ShipmentMethodReadParams = ResourceQueryParams;

/** In-memory GET cache TTL for method reference dumps / by-id (5 minutes). */
const SHIPMENT_METHOD_CACHE_TTL_MS = 5 * 60_000;

/**
 * Shipment method / carrier utility reads (`GET /shipment_method/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link ShipmentMethodModel}
 *
 * @example
 * ```ts
 * const methods = inject(ShipmentMethodService);
 *
 * methods.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * methods.readAll().subscribe((res) => console.log(res.data?.[0]?.name));
 * methods.readById(12).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ShipmentMethodService {
  private readonly api = inject(ApiClient);

  /** Paginated method page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>>;

  /** Full method list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>>;

  /** Single method — {@link ResourceId} number. */
  read(
    id: number,
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel>>;

  read(
    id: ResourceId = null,
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel | ShipmentMethodModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(SHIPMENT_METHOD_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, SHIPMENT_METHOD_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(
            id,
            res.data,
            mapShipmentMethod,
            mapShipmentMethodList,
          ),
        })),
      );
  }

  /** Paginated page — alias for {@link read}(`null`, params). */
  readPage(
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>> {
    return this.read(null, params);
  }

  /** Full list — alias for {@link read}(`'all'`). */
  readAll(
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>> {
    return this.read('all', params);
  }

  /** Single record — alias for {@link read}(id). */
  readById(
    id: number,
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel>> {
    return this.read(id, params);
  }
}
