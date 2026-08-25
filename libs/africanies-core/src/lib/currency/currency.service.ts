import { inject, Injectable } from '@angular/core';

import { map, Observable, tap } from 'rxjs';

import type {
  ApiResponseModel,
  CurrencyCreateRequestModel,
  CurrencyDeleteRequestModel,
  CurrencyModel,
  CurrencyUpdateRequestModel,
  ResourceId,
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
  CURRENCY_CREATE_PATH,
  CURRENCY_DELETE_PATH,
  CURRENCY_READ_PATH,
  CURRENCY_UPDATE_PATH,
  mapCurrency,
  mapCurrencyList,
  toCurrencyCreateBody,
  toCurrencyDeleteBody,
  toCurrencyUpdateBody,
} from './currency.mapper';

/** In-memory GET cache TTL for currency reference dumps / by-id (5 minutes). */
const CURRENCY_CACHE_TTL_MS = 5 * 60_000;

/**
 * Currency App Settings API (`GET /currency/read/{id?}` plus create / update / delete).
 *
 * Uses the AFRICANIES {@link ResourceId} convention for reads:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link CurrencyModel}
 *
 * Paginated responses embed a Laravel paginator in `data`; {@link ApiClient}
 * flattens that to `data: CurrencyModel[]` plus `pagination`.
 *
 * Writes send `"1"` / `"0"` flags. Delete uses a JSON `{ id }` body (not query
 * params). After each write, show `res.message` and call {@link readPage} again.
 *
 * @example
 * ```ts
 * const currencies = inject(CurrencyService);
 *
 * currencies.readPage({ page: 1, order: 'desc' }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * currencies.readAll().subscribe((res) => console.log(res.data?.[0]?.short_code));
 * currencies.readById(5).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly api = inject(ApiClient);

  /** Paginated currency page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel[]>>;

  /** Full currency list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel[]>>;

  /** Single currency — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel | CurrencyModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(CURRENCY_READ_PATH, id), {
        toast: false,
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, CURRENCY_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapCurrency, mapCurrencyList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<CurrencyModel[]>> {
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
  ): Observable<ApiResponseModel<CurrencyModel>> {
    return this.read(id, params);
  }

  /**
   * Create a currency (`POST /currency/create`).
   *
   * `name` / `short_code` come from the host’s local currency list, not GET.
   * Flags may be boolean or `"1"` / `"0"`; they are serialized to `"1"` / `"0"`.
   *
   * @param body - Create payload.
   * @returns Normalized envelope — use {@link ApiResponseModel.message}.
   */
  create(
    body: CurrencyCreateRequestModel,
  ): Observable<ApiResponseModel<unknown>> {
    return this.api
      .post<unknown, ReturnType<typeof toCurrencyCreateBody>>(
        CURRENCY_CREATE_PATH,
        toCurrencyCreateBody(body),
      )
      .pipe(tap(() => this.api.clearCache()));
  }

  /**
   * Update rates, flags, and payment methods (`PUT /currency/update`).
   *
   * Name and short code are not sent. Before edit, copy the row into the form
   * (`true` / `false` may stay booleans — this method serializes flags).
   *
   * @param body - Update payload including `id`.
   * @returns Normalized envelope — use {@link ApiResponseModel.message}.
   */
  update(
    body: CurrencyUpdateRequestModel,
  ): Observable<ApiResponseModel<unknown>> {
    return this.api
      .put<unknown, ReturnType<typeof toCurrencyUpdateBody>>(
        CURRENCY_UPDATE_PATH,
        toCurrencyUpdateBody(body),
      )
      .pipe(tap(() => this.api.clearCache()));
  }

  /**
   * Delete a currency (`DELETE /currency/delete`) with JSON body `{ id }`.
   *
   * @param body - Currency id or `{ id }`.
   * @returns Normalized envelope — use {@link ApiResponseModel.message}.
   */
  remove(
    body: CurrencyDeleteRequestModel | number,
  ): Observable<ApiResponseModel<unknown>> {
    return this.api
      .delete<unknown, { id: number }>(
        CURRENCY_DELETE_PATH,
        toCurrencyDeleteBody(body),
      )
      .pipe(tap(() => this.api.clearCache()));
  }
}
