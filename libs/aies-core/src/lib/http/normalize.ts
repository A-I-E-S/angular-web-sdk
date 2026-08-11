import type {
  ApiErrorDetail,
  ApiResponseModel,
  PaginationMeta,
} from '@aies/aies-models';

/**
 * Narrow unknown JSON into a record for defensive key reads.
 * Primitives and arrays are treated as non-objects so callers fall through
 * to the "unwrapped payload" path.
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
 * Whether the payload looks like an AIES API envelope.
 * Requires both `success` and `data` so accidental objects with only one
 * of those keys are not mis-classified as envelopes.
 * @param value - Candidate JSON value.
 * @returns True when both `success` and `data` keys are present.
 */
function isWrappedEnvelope(value: unknown): boolean {
  const record = asRecord(value);
  return record !== null && 'success' in record && 'data' in record;
}

/**
 * Coalesce a single error entry so missing field/code become `null`.
 * `message` falls back to empty string because {@link ApiErrorDetail} requires it.
 * @param value - Raw error entry from the wire.
 * @returns A null-safe {@link ApiErrorDetail}.
 */
function normalizeErrorDetail(value: unknown): ApiErrorDetail {
  const record = asRecord(value) ?? {};
  return {
    field: (record['field'] as string | null | undefined) ?? null,
    message: String(record['message'] ?? ''),
    code: (record['code'] as string | null | undefined) ?? null,
  };
}

/**
 * Map pagination from camelCase or snake_case wire forms.
 * Backends are inconsistent; reading both keeps consumers on one SDK shape.
 * @param value - Raw pagination object (camelCase or snake_case).
 * @returns Normalized meta, or `null` when `value` is not an object.
 */
function normalizePagination(value: unknown): PaginationMeta | null {
  const record = asRecord(value);
  if (record === null) {
    return null;
  }

  const currentPage = record['currentPage'] ?? record['current_page'];
  const perPage = record['perPage'] ?? record['per_page'];
  const totalItems = record['totalItems'] ?? record['total_items'];
  const totalPages = record['totalPages'] ?? record['total_pages'];
  const hasNextPage = record['hasNextPage'] ?? record['has_next_page'];
  const hasPreviousPage =
    record['hasPreviousPage'] ?? record['has_previous_page'];

  // If the object is empty of known keys, still return a fully-null-safe
  // numeric/boolean shape rather than undefined fields.
  return {
    currentPage: Number(currentPage ?? 0),
    perPage: Number(perPage ?? 0),
    totalItems: Number(totalItems ?? 0),
    totalPages: Number(totalPages ?? 0),
    hasNextPage: Boolean(hasNextPage),
    hasPreviousPage: Boolean(hasPreviousPage),
  };
}

/**
 * Normalize any HTTP JSON body into a fully null-safe {@link ApiResponseModel}.
 *
 * Every envelope field is explicitly set (never left `undefined`) so the
 * SDK's `| null` types match runtime reality — backends often omit
 * `errors` / `pagination` / `statusCode` on success.
 *
 * - Wrapped bodies (`success` + `data`): coalesce fields; map `status_code`
 *   → `statusCode` and snake_case pagination keys when present.
 * - Unwrapped bodies: wrap as `{ success: true, data: raw, …null }`.
 *
 * @typeParam T - Expected `data` payload type.
 * @param raw - Parsed response body from HttpClient.
 * @returns A complete {@link ApiResponseModel} with no undefined fields.
 */
export function normalize<T>(raw: unknown): ApiResponseModel<T> {
  if (isWrappedEnvelope(raw)) {
    const record = asRecord(raw);
    if (record !== null) {
      const success = record['success'];
      const statusCode =
        record['statusCode'] ?? record['status_code'] ?? null;

      return {
        success: typeof success === 'boolean' ? success : Boolean(success),
        message: (record['message'] as string | null | undefined) ?? null,
        data: (record['data'] as T | null | undefined) ?? null,
        errors: Array.isArray(record['errors'])
          ? record['errors'].map(normalizeErrorDetail)
          : null,
        pagination: normalizePagination(record['pagination']),
        statusCode:
          statusCode === null || statusCode === undefined
            ? null
            : Number(statusCode),
      };
    }
  }

  return {
    success: true,
    message: null,
    data: (raw as T | null | undefined) ?? null,
    errors: null,
    pagination: null,
    statusCode: null,
  };
}
