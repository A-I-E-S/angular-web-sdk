import type { ZoneModel } from '@aies/aies-models';

/** Zone read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const ZONE_READ_PATH = '/zone/read/records';

/**
 * Narrow unknown JSON into a record for defensive key reads.
 * @param value - Candidate JSON value.
 * @returns A record when `value` is a plain object; otherwise `null`.
 */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Coerce a wire number that may arrive as a string.
 * @param value - Raw numeric field.
 * @returns Finite number, or `0` when missing/invalid.
 */
function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Coerce a nullable string field (missing → `null`).
 * @param value - Raw string field.
 * @returns String or `null`.
 */
function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

/**
 * Map a wire zone into {@link ZoneModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - Zone object from the wire.
 * @returns Normalized {@link ZoneModel}.
 */
export function mapZone(raw: unknown): ZoneModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    name: String(record['name'] ?? ''),
    type: String(record['type'] ?? ''),
    active: Boolean(record['active']),
    deletedAt: asNullableString(
      record['deletedAt'] ?? record['deleted_at'],
    ),
    createdAt: asNullableString(
      record['createdAt'] ?? record['created_at'],
    ),
    updatedAt: asNullableString(
      record['updatedAt'] ?? record['updated_at'],
    ),
  };
}

/**
 * Map a list (or single object) payload into {@link ZoneModel}[].
 *
 * @param raw - `data` payload from `/zone/read/records/{id|all}`.
 * @returns Mapped zone list (empty when `raw` is null/undefined).
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
