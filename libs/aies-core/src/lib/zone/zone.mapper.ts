import type { ZoneModel } from '@aies/aies-models';

/** Zone read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const ZONE_READ_PATH = '/zone/read/records';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

/**
 * Map a wire zone into {@link ZoneModel} (snake_case preserved).
 * @param raw
 */
export function mapZone(raw: unknown): ZoneModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    name: String(record['name'] ?? ''),
    type: String(record['type'] ?? ''),
    active: Boolean(record['active']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
  };
}

/**
 * Map a list (or single object) payload into {@link ZoneModel}[].
 * @param raw
 */
export function mapZoneList(raw: unknown): ZoneModel[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapZone(entry));
  }
  return [mapZone(raw)];
}
