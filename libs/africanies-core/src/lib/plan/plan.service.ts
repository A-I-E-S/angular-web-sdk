import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  PlanModel,
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
import { mapPlan, mapPlanList, PLAN_READ_PATH } from './plan.mapper';

/** In-memory GET cache TTL for plan reference dumps / by-id (5 minutes). */
const PLAN_CACHE_TTL_MS = 5 * 60_000;

/**
 * Public subscription-plan reads (`GET /public/plan/read/{id?}`).
 *
 * Uses the AFRICANIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link PlanModel}
 *
 * @example
 * ```ts
 * const plans = inject(PlanService);
 *
 * plans.readPage({ page: 1, order: 'desc' }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * plans.readById(1).subscribe((res) => {
 *   console.log(res.data?.packages?.length);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(ApiClient);

  /** Paginated plan page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel[]>>;

  /** Full plan list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel[]>>;

  /** Single plan — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel | PlanModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(PLAN_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, PLAN_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapPlan, mapPlanList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<PlanModel[]>> {
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
  ): Observable<ApiResponseModel<PlanModel>> {
    return this.read(id, params);
  }
}
