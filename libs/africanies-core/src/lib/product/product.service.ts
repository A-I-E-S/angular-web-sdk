import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ProductModel,
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
import { mapProduct, mapProductList, PRODUCT_READ_PATH } from './product.mapper';

/** In-memory GET cache TTL for product reference dumps / by-id (5 minutes). */
const PRODUCT_CACHE_TTL_MS = 5 * 60_000;

/**
 * Product utility reads (`GET /product/read/{id?}`).
 *
 * Uses the AFRICANIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link ProductModel}
 *
 * @example
 * ```ts
 * const products = inject(ProductService);
 *
 * products.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * products.readAll().subscribe((res) => console.log(res.data?.[0]?.hs_code));
 * products.readById(6280).subscribe((res) => console.log(res.data?.name));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiClient);

  /** Paginated product page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel[]>>;

  /** Full product list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel[]>>;

  /** Single product — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel | ProductModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(PRODUCT_READ_PATH, id), {
        toast: false,
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, PRODUCT_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapProduct, mapProductList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<ProductModel[]>> {
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
  ): Observable<ApiResponseModel<ProductModel>> {
    return this.read(id, params);
  }
}
