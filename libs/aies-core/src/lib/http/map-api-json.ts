import type { ApiJsonObjectModel, ApiJsonValue } from '@aies/aies-models';

import { asArray, asRecord } from './wire';

/**
 * Deep-map arbitrary JSON into {@link ApiJsonValue} with no `undefined`.
 *
 * - `undefined` / unsupported types → `null`
 * - Arrays → every element mapped (never sparse/`undefined` slots)
 * - Objects → every own key mapped to {@link ApiJsonValue}
 *
 * @param raw - Wire value (may be missing or malformed).
 * @returns Null-safe JSON tree, or `null` when `raw` is nullish/unusable.
 */
export function mapApiJsonValue(raw: unknown): ApiJsonValue | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === 'string' || typeof raw === 'boolean') {
    return raw;
  }
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapApiJsonValue(entry) ?? null);
  }
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  const out: Record<string, ApiJsonValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = mapApiJsonValue(value) ?? null;
  }
  return out as ApiJsonObjectModel;
}

/**
 * Map a wire list into a null-safe {@link ApiJsonValue} array.
 * Non-arrays become `[]`.
 * @param raw - Candidate list.
 * @returns Mapped array (never null/undefined).
 */
export function mapApiJsonList(raw: unknown): ApiJsonValue[] {
  return asArray(raw).map((entry) => mapApiJsonValue(entry) ?? null);
}
