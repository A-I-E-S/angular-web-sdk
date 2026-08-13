import type {
  ApiErrorDetailModel,
  ApiResponseModel,
  PaginationMetaModel,
} from '@aies/aies-models';

/**
 * Narrow unknown JSON into a record for defensive key reads.
 * @param value
 */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Whether the payload looks like an AIES API envelope.
 * @param value
 */
function isWrappedEnvelope(value: unknown): boolean {
  const record = asRecord(value);
  return record !== null && 'success' in record && 'data' in record;
}

/**
 * Coalesce a single error entry so missing field/code become `null`.
 * @param value
 */
function normalizeErrorDetail(value: unknown): ApiErrorDetailModel {
  const record = asRecord(value) ?? {};
  return {
    field: (record['field'] as string | null | undefined) ?? null,
    message: String(record['message'] ?? ''),
    code: (record['code'] as string | null | undefined) ?? null,
  };
}

/**
 * Map pagination from snake_case (preferred) or legacy camelCase wire forms.
 * @param value
 */
function normalizePagination(value: unknown): PaginationMetaModel | null {
  const record = asRecord(value);
  if (record === null) {
    return null;
  }

  const current_page = record['current_page'] ?? record['currentPage'];
  const per_page = record['per_page'] ?? record['perPage'];
  const total_items = record['total_items'] ?? record['totalItems'];
  const total_pages = record['total_pages'] ?? record['totalPages'];
  const has_next_page = record['has_next_page'] ?? record['hasNextPage'];
  const has_previous_page =
    record['has_previous_page'] ?? record['hasPreviousPage'];

  return {
    current_page: Number(current_page ?? 0),
    per_page: Number(per_page ?? 0),
    total_items: Number(total_items ?? 0),
    total_pages: Number(total_pages ?? 0),
    has_next_page: Boolean(has_next_page),
    has_previous_page: Boolean(has_previous_page),
  };
}

/**
 * Normalize any HTTP JSON body into a fully null-safe {@link ApiResponseModel}.
 *
 * Envelope fields use snake_case where the wire does (`status_code`,
 * pagination keys). Unwrapped bodies are wrapped as success envelopes.
 * @param raw
 */
export function normalize<T>(raw: unknown): ApiResponseModel<T> {
  if (isWrappedEnvelope(raw)) {
    const record = asRecord(raw);
    if (record !== null) {
      const success = record['success'];
      const status_code =
        record['status_code'] ?? record['statusCode'] ?? null;

      return {
        success: typeof success === 'boolean' ? success : Boolean(success),
        message: (record['message'] as string | null | undefined) ?? null,
        data: (record['data'] as T | null | undefined) ?? null,
        errors: Array.isArray(record['errors'])
          ? record['errors'].map(normalizeErrorDetail)
          : null,
        pagination: normalizePagination(record['pagination']),
        status_code:
          status_code === null || status_code === undefined
            ? null
            : Number(status_code),
      };
    }
  }

  return {
    success: true,
    message: null,
    data: (raw as T | null | undefined) ?? null,
    errors: null,
    pagination: null,
    status_code: null,
  };
}
