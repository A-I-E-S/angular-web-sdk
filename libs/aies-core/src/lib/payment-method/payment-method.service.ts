import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  PaymentMethodModel,
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
  mapPaymentMethod,
  mapPaymentMethodList,
  PAYMENT_METHOD_READ_PATH,
} from './payment-method.mapper';

/** Query bag for payment-method reads (pagination applies only when `id` is `null`). */
export type PaymentMethodReadParams = ResourceQueryParams;

/** In-memory GET cache TTL for payment-method dumps / by-id (5 minutes). */
const PAYMENT_METHOD_CACHE_TTL_MS = 5 * 60_000;

/**
 * Payment-method utility reads (`GET /payment_method/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link PaymentMethodModel}
 *
 * Paginated responses embed a Laravel paginator in `data`; {@link ApiClient}
 * flattens that to `data: PaymentMethodModel[]` plus `pagination`.
 *
 * @example
 * ```ts
 * const methods = inject(PaymentMethodService);
 *
 * methods.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * methods.readAll().subscribe((res) => console.log(res.data?.[0]?.name));
 * methods.readById(4).subscribe((res) => console.log(res.data?.currencies));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private readonly api = inject(ApiClient);

  /** Paginated payment-method page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel[]>>;

  /** Full payment-method list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel[]>>;

  /** Single payment method — {@link ResourceId} number. */
  read(
    id: number,
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel>>;

  read(
    id: ResourceId = null,
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel | PaymentMethodModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(PAYMENT_METHOD_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, PAYMENT_METHOD_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(
            id,
            res.data,
            mapPaymentMethod,
            mapPaymentMethodList,
          ),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single record — alias for {@link read}(id).
   * @param id
   * @param params
   */
  readById(
    id: number,
    params?: PaymentMethodReadParams,
  ): Observable<ApiResponseModel<PaymentMethodModel>> {
    return this.read(id, params);
  }
}
