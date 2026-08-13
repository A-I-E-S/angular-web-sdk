import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  CountryModel,
  ResourceId,
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
  COUNTRY_READ_PATH,
  mapCountry,
  mapCountryList,
} from './country.mapper';

/** Query bag for country reads (pagination applies only when `id` is `null`). */
export type CountryReadParams = ResourceQueryParams;

/** In-memory GET cache TTL for country reference dumps / by-id (5 minutes). */
const COUNTRY_CACHE_TTL_MS = 5 * 60_000;

/**
 * Public country utility reads (`GET /public/country/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link CountryModel}
 *
 * @example
 * ```ts
 * const countries = inject(CountryService);
 *
 * countries.read(null, { page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 *
 * countries.readAll().subscribe((res) => console.log(res.data?.length));
 * countries.readById(1).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly api = inject(ApiClient);

  /**
   * Paginated country page — {@link ResourceId} `null`.
   *
   * @param id - Omit or pass `null` for a paginated list.
   * @param params - Optional page/size/order and filters.
   */
  read(
    id?: null,
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>>;

  /**
   * Full country list — {@link ResourceId} `'all'`.
   *
   * @param id - Must be `'all'`.
   * @param params - Optional filters (pagination fields ignored).
   */
  read(
    id: 'all',
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>>;

  /**
   * Single country — {@link ResourceId} number.
   *
   * @param id - Country id.
   * @param params - Optional filters (pagination fields ignored).
   */
  read(
    id: number,
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel>>;

  read(
    id: ResourceId = null,
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel | CountryModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(COUNTRY_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, COUNTRY_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapCountry, mapCountryList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   */
  readPage(
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   */
  readAll(
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single record — alias for {@link read}(id).
   */
  readById(
    id: number,
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel>> {
    return this.read(id, params);
  }
}
