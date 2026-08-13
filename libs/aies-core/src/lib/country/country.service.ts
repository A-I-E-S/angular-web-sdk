import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type { ApiResponseModel, CountryModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  COUNTRY_READ_PATH,
  mapCountryList,
} from './country.mapper';

/** Optional query string for country reads (null/undefined entries omitted). */
export type CountryReadParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/** In-memory GET cache TTL for country reference data (5 minutes). */
const COUNTRY_CACHE_TTL_MS = 5 * 60_000;

/**
 * Public country utility reads (`GET /public/country/read/{id|all}`).
 *
 * Default id is `'all'`. Response `data` is always mapped to {@link CountryModel}[]
 * (snake_case wire fields such as `state_code` become `stateCode`).
 *
 * @example
 * ```ts
 * const countries = inject(CountryService);
 *
 * countries.read().subscribe((res) => {
 *   if (res.success) console.log(res.data?.length);
 * });
 *
 * countries.readById(1).subscribe((res) => {
 *   console.log(res.data?.[0]?.name);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CountryService {
  private readonly api = inject(ApiClient);

  /**
   * Fetch countries for `id` (defaults to `'all'`).
   *
   * @param id - Numeric country id or `'all'`.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link CountryModel}[].
   */
  read(
    id: number | 'all' = 'all',
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>> {
    const path = `${COUNTRY_READ_PATH}/${id}`;
    return this.api
      .get<unknown>(path, {
        params,
        cacheTtlMs: COUNTRY_CACHE_TTL_MS,
      })
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapCountryList(res.data),
        })),
      );
  }

  /**
   * Full country list — alias for {@link read}(`'all'`).
   *
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link CountryModel}[].
   */
  readAll(
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single-country read by numeric id (still returns a one-element array).
   *
   * @param id - Country id.
   * @param params - Optional query string values.
   * @returns Normalized envelope with mapped {@link CountryModel}[].
   */
  readById(
    id: number,
    params?: CountryReadParams,
  ): Observable<ApiResponseModel<CountryModel[]>> {
    return this.read(id, params);
  }
}
