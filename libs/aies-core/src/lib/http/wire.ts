/**
 * Null-safe coercions for AIES wire JSON.
 *
 * Mappers should run every request/response field through these helpers so
 * missing keys, `null`, and wrong JSON types never throw at `.map` / `.trim`.
 */

/**
 * Narrow unknown JSON into a plain object record.
 * @param value - Candidate value.
 * @returns Record when a non-array object; otherwise `null`.
 */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Coerce a value to an array. Non-arrays become `[]`.
 * @param value - Candidate list.
 */
export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Map every element of a wire list. Non-arrays yield `[]`.
 * @param value - Candidate list.
 * @param mapOne - Per-item mapper.
 */
export function mapArray<T>(
  value: unknown,
  mapOne: (entry: unknown) => T,
): T[] {
  return asArray(value).map(mapOne);
}

/**
 * If a list payload is wrapped in a Laravel paginator / `{ data | items }`,
 * return the inner array. Otherwise return `value` unchanged.
 * @param value - Envelope `data` or a nested list field.
 */
function unwrapListPayload(value: unknown): unknown {
  if (Array.isArray(value) || value == null) {
    return value;
  }
  const record = asRecord(value);
  if (record === null) {
    return value;
  }
  const nested = record['data'] ?? record['items'] ?? record['results'];
  if (Array.isArray(nested)) {
    return nested;
  }
  if (
    nested == null &&
    ('current_page' in record ||
      'currentPage' in record ||
      'last_page' in record ||
      'lastPage' in record ||
      'per_page' in record ||
      'perPage' in record)
  ) {
    return [];
  }
  return value;
}

/**
 * Map a list-or-single payload (Laravel sometimes sends one object).
 *
 * - `null` / `undefined` → `[]`
 * - paginator / `{ data | items }` → mapped inner rows
 * - array → mapped items
 * - anything else → one mapped item
 *
 * @param value - Envelope `data` (or a nested list field).
 * @param mapOne - Per-item mapper.
 */
export function mapList<T>(
  value: unknown,
  mapOne: (entry: unknown) => T,
): T[] {
  const list = unwrapListPayload(value);
  if (list == null) {
    return [];
  }
  if (Array.isArray(list)) {
    return list.map(mapOne);
  }
  return [mapOne(list)];
}

/**
 * Finite number, or `fallback` when missing/invalid.
 * @param value - Raw numeric field.
 * @param fallback - Default when not a finite number.
 */
export function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Finite number, or `null` when missing/invalid.
 * @param value - Raw numeric field.
 */
export function asNullableNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * String, or `fallback` when the value cannot be stringified usefully.
 * @param value - Raw string field.
 * @param fallback - Default when nullish / non-scalar.
 */
export function asString(value: unknown, fallback = ''): string {
  if (value == null) {
    return fallback;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
}

/**
 * String or `null` (never `undefined`).
 * @param value - Raw string field.
 */
export function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

/**
 * Boolean from wire flags (`true` / `false` / `1` / `0` / `"true"` / `"1"`).
 * Missing values are `false`.
 * @param value - Raw flag.
 */
export function asBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  const trimmed = String(value ?? '')
    .trim()
    .toLowerCase();
  return trimmed === '1' || trimmed === 'true';
}

/**
 * Boolean or `null` when the field is absent / unparseable.
 * @param value - Raw flag.
 */
export function asNullableBoolean(value: unknown): boolean | null {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '1' || trimmed === 'true') {
      return true;
    }
    if (trimmed === '0' || trimmed === 'false') {
      return false;
    }
  }
  return null;
}

/**
 * Wire `"1"` / `"0"` from a boolean, number, or string flag.
 * @param value - Host or wire flag.
 */
export function toFlag01(value: unknown): '0' | '1' {
  return asBoolean(value) ? '1' : '0';
}

/**
 * User-model `0` / `1` flag, or `null` when absent.
 * @param value - Raw flag.
 */
export function asNullableFlag01(value: unknown): 0 | 1 | null {
  if (value == null || value === '') {
    return null;
  }
  if (value === 1 || value === '1' || value === true) {
    return 1;
  }
  if (value === 0 || value === '0' || value === false) {
    return 0;
  }
  return null;
}
