import type { ZoneModel } from '@africanies/africanies-models';

import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** Zone read base path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const ZONE_READ_PATH = '/zone/read/records';

/**
 * Map a wire zone into {@link ZoneModel} (snake_case preserved).
 * @param raw
 */
export function mapZone(raw: unknown): ZoneModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    type: asString(record['type']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
  };
}

/**
 * Map a list (or single object) payload into {@link ZoneModel}[].
 * @param raw
 */
export function mapZoneList(raw: unknown): ZoneModel[] {
  return mapList(raw, mapZone);
}
