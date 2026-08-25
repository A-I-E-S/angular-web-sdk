import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ResourceId,
  ServiceModel,
} from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from '../http/resource-path';
import {
  mapService,
  mapServiceList,
  SERVICE_READ_PATH,
} from './service.mapper';

/** In-memory GET cache TTL for service reference dumps / by-id (5 minutes). */
const SERVICE_CACHE_TTL_MS = 5 * 60_000;

/**
 * Public subscription-service reads (`GET /public/service/read/{id?}`).
 *
 * Uses the AFRICANIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link ServiceModel}
 *
 * @example
 * ```ts
 * const services = inject(ServiceService);
 *
 * services.readPage({ page: 1, search: 'box' }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * services.readAll().subscribe((res) => console.log(res.data?.length));
 * services.readById(3).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly api = inject(ApiClient);

  /** Paginated service page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel[]>>;

  /** Full service list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel[]>>;

  /** Single service — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel | ServiceModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(SERVICE_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, SERVICE_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapService, mapServiceList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ServiceModel[]>> {
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
  ): Observable<ApiResponseModel<ServiceModel>> {
    return this.read(id, params);
  }
}
