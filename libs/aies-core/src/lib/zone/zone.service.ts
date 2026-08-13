import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type { ApiResponseModel, ZoneModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { mapZoneList, ZONE_READ_PATH } from './zone.mapper';

/** Optional query string for zone reads (null/undefined omitted). */
export type ZoneReadParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/** In-memory GET cache TTL for zone reference data (5 minutes). */
const ZONE_CACHE_TTL_MS = 5 * 60_000;

/**
 * Zone utility reads (`GET /zone/read/records/{id|all}`).
 *
 * Default id is `'all'`. Response `data` is always mapped to {@link ZoneModel}[].
 *
 * @example
 * ```ts
 * const zones = inject(ZoneService);
 *
 * zones.read().subscribe((res) => {
 *   if (res.success) console.log(res.data?.[0]?.name);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ZoneService {
  private readonly api = inject(ApiClient);

  /**
   * Fetch zones for `id` (defaults to `'all'`).
   *
   * @param id - Numeric zone id or `'all'`.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ZoneModel}[].
   */
  read(
    id: number | 'all' = 'all',
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel[]>> {
    const path = `${ZONE_READ_PATH}/${id}`;
    return this.api
      .get<unknown>(path, {
        params,
        cacheTtlMs: ZONE_CACHE_TTL_MS,
      })
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapZoneList(res.data),
        })),
      );
  }

  /**
   * Full zone list — alias for {@link read}(`'all'`).
   *
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ZoneModel}[].
   */
  readAll(params?: ZoneReadParams): Observable<ApiResponseModel<ZoneModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single-zone read by numeric id (still returns a one-element array).
   *
   * @param id - Zone id.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link ZoneModel}[].
   */
  readById(
    id: number,
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel[]>> {
    return this.read(id, params);
  }
}
