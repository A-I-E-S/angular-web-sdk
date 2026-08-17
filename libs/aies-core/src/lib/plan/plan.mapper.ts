import type { PlanModel, PlanPackageModel } from '@aies/aies-models';

import {
  asBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
} from '../http/wire';

/** Public plan read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const PLAN_READ_PATH = '/public/plan/read';

/**
 * Map a wire plan package into {@link PlanPackageModel}.
 * @param raw - Package object nested under a plan.
 * @returns Normalized {@link PlanPackageModel}.
 */
export function mapPlanPackage(raw: unknown): PlanPackageModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    plan_id: asNullableNumber(record['plan_id'] ?? record['planId']),
    company_service_id: asNullableNumber(
      record['company_service_id'] ?? record['companyServiceId'],
    ),
    name: asString(record['name']),
    metrics: asNullableString(record['metrics']),
    volume: asNullableNumber(record['volume']),
    discount: asNullableString(record['discount']),
    model: asNullableString(record['model']),
    monthly: asNullableString(record['monthly']),
    quarterly: asNullableString(record['quarterly']),
    biannually: asNullableString(record['biannually']),
    annually: asNullableString(record['annually']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
  };
}

/**
 * Map a wire plan into {@link PlanModel} (snake_case preserved).
 * @param raw - Single plan object from the API.
 * @returns Normalized {@link PlanModel}.
 */
export function mapPlan(raw: unknown): PlanModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    packages: mapArray(record['packages'], mapPlanPackage),
  };
}

/**
 * Map a list (or single object) payload into {@link PlanModel}[].
 * @param raw - `data` payload from `/public/plan/read/{id|all}`.
 * @returns Mapped plan list.
 */
export function mapPlanList(raw: unknown): PlanModel[] {
  return mapList(raw, mapPlan);
}
