import type { ServiceModel } from '@africanies/africanies-models';

import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** Public service read base path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const SERVICE_READ_PATH = '/public/service/read';

/**
 * Map a wire service into {@link ServiceModel} (snake_case preserved).
 * @param raw - Single service object from the API.
 * @returns Normalized {@link ServiceModel}.
 */
export function mapService(raw: unknown): ServiceModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    description: asNullableString(record['description']),
    model: asString(record['model']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
  };
}

/**
 * Map a list (or single object) payload into {@link ServiceModel}[].
 * @param raw - `data` payload from `/public/service/read/{id|all}`.
 * @returns Mapped service list.
 */
export function mapServiceList(raw: unknown): ServiceModel[] {
  return mapList(raw, mapService);
}
