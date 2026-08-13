import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ShipmentMethodModel,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  mapShipmentMethodList,
  SHIPMENT_METHOD_READ_PATH,
} from './shipment-method.mapper';

/** Optional query string for shipment-method reads (null/undefined omitted). */
export type ShipmentMethodReadParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/** In-memory GET cache TTL for shipment-method reference data (5 minutes). */
const SHIPMENT_METHOD_CACHE_TTL_MS = 5 * 60_000;

/**
 * Shipment method / carrier utility reads (`GET /shipment_method/read/{id|all}`).
 *
 * Default id is `'all'`. Response `data` is always mapped to
 * {@link ShipmentMethodModel}[] (snake_case wire fields become camelCase;
 * embedded `zone_values` become {@link ShipmentMethodModel.zoneValues}).
 *
 * @example
 * ```ts
 * const methods = inject(ShipmentMethodService);
 *
 * methods.read().subscribe((res) => {
 *   if (res.success) console.log(res.data?.[0]?.name);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ShipmentMethodService {
  private readonly api = inject(ApiClient);

  /**
   * Fetch shipment methods for `id` (defaults to `'all'`).
   *
   * @param id - Numeric method id or `'all'`.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ShipmentMethodModel}[].
   */
  read(
    id: number | 'all' = 'all',
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>> {
    const path = `${SHIPMENT_METHOD_READ_PATH}/${id}`;
    return this.api
      .get<unknown>(path, {
        params,
        cacheTtlMs: SHIPMENT_METHOD_CACHE_TTL_MS,
      })
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapShipmentMethodList(res.data),
        })),
      );
  }

  /**
   * Full method list — alias for {@link read}(`'all'`).
   *
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ShipmentMethodModel}[].
   */
  readAll(
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single-method read by numeric id (still returns a one-element array).
   *
   * @param id - Shipment method id.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ShipmentMethodModel}[].
   */
  readById(
    id: number,
    params?: ShipmentMethodReadParams,
  ): Observable<ApiResponseModel<ShipmentMethodModel[]>> {
    return this.read(id, params);
  }
}
