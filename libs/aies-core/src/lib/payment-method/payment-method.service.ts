import { inject, Injectable } from '@angular/core';

import { map, Observable, tap } from 'rxjs';

import type {
  ApiResponseModel,
  PaymentMethodModel,
  PaymentMethodUpdateRequestModel,
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
  PAYMENT_METHOD_UPDATE_PATH,
  toPaymentMethodUpdateBody,
} from './payment-method.mapper';

/**
 * Query bag for payment-method reads.
 *
 * Pagination (`page` / `size` / `order`) applies only when `id` is `null`.
 * App Settings also sends `search`, `from`, and `to` on the paginated list.
 */
export type PaymentMethodReadParams = ResourceQueryParams & {
  /** Search text. */
  search?: string;
  /** Date-range start. */
  from?: string;
  /** Date-range end. */
  to?: string;
};

/** In-memory GET cache TTL for payment-method dumps / by-id (5 minutes). */
const PAYMENT_METHOD_CACHE_TTL_MS = 5 * 60_000;

/**
 * Payment-method App Settings API (`GET /payment_method/read/{id?}` plus update).
 *
 * Uses the AIES {@link ResourceId} convention for reads:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link PaymentMethodModel}
 *
 * Paginated responses embed a Laravel paginator in `data`; {@link ApiClient}
 * flattens that to `data: PaymentMethodModel[]` plus `pagination`.
 *
 * The only write is {@link update} (active toggle). There is no create or
 * delete on this board — processors are linked from Currencies via
 * `payment_method_ids`. After update, show `res.message` and patch the row’s
 * local `updated_at` — do not reload the full list.
 *
 * @example
 * ```ts
 * const methods = inject(PaymentMethodService);
 *
 * methods.readPage({ page: 1, order: 'desc' }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * methods.readAll().subscribe((res) => console.log(res.data?.[0]?.name));
 * methods.readById(4).subscribe((res) => console.log(res.data?.currencies));
 *
 * methods.update({
 *   id: row.id,
 *   name: row.name,
 *   model: row.model,
 *   active: nextActive,
 * }).subscribe((res) => {
 *   // toast res.message; patch row.updated_at locally
 * });
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

  /**
   * Toggle / update a payment method (`PUT /payment_method/update`).
   *
   * App Settings only edits `active` (status switch). Resend `name` and
   * `model` from the current row. `active` may be boolean or `"1"` / `"0"`;
   * this method serializes to `"1"` / `"0"`.
   *
   * On success: show {@link ApiResponseModel.message}, patch that row’s
   * local `updated_at`, and do **not** call {@link readPage} again.
   *
   * @param body - Update payload including `id`.
   * @returns Normalized envelope — use {@link ApiResponseModel.message}.
   */
  update(
    body: PaymentMethodUpdateRequestModel,
  ): Observable<ApiResponseModel<unknown>> {
    return this.api
      .put<unknown, ReturnType<typeof toPaymentMethodUpdateBody>>(
        PAYMENT_METHOD_UPDATE_PATH,
        toPaymentMethodUpdateBody(body),
      )
      .pipe(tap(() => this.api.clearCache()));
  }
}
