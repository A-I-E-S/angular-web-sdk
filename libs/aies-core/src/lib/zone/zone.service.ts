import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ResourceId,
  ZoneModel,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from '../http/resource-path';
import { mapZone, mapZoneList, ZONE_READ_PATH } from './zone.mapper';

/** Query bag for zone reads (pagination applies only when `id` is `null`). */
export type ZoneReadParams = ResourceQueryParams;

/** In-memory GET cache TTL for zone reference dumps / by-id (5 minutes). */
const ZONE_CACHE_TTL_MS = 5 * 60_000;

/**
 * Zone utility reads (`GET /zone/read/records/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link ZoneModel}
 *
 * @example
 * ```ts
 * const zones = inject(ZoneService);
 *
 * zones.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * zones.readAll().subscribe((res) => console.log(res.data?.length));
 * zones.readById(1).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ZoneService {
  private readonly api = inject(ApiClient);

  /** Paginated zone page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel[]>>;

  /** Full zone list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel[]>>;

  /** Single zone — {@link ResourceId} number. */
  read(
    id: number,
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel>>;

  read(
    id: ResourceId = null,
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel | ZoneModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(ZONE_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, ZONE_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapZone, mapZoneList),
        })),
      );
  }

  /** Paginated page — alias for {@link read}(`null`, params). */
  readPage(
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel[]>> {
    return this.read(null, params);
  }

  /** Full list — alias for {@link read}(`'all'`). */
  readAll(params?: ZoneReadParams): Observable<ApiResponseModel<ZoneModel[]>> {
    return this.read('all', params);
  }

  /** Single record — alias for {@link read}(id). */
  readById(
    id: number,
    params?: ZoneReadParams,
  ): Observable<ApiResponseModel<ZoneModel>> {
    return this.read(id, params);
  }
}
