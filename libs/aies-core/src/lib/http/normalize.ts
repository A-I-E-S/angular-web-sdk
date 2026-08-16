import type {
  ApiErrorDetailModel,
  ApiResponseModel,
  PaginationMetaModel,
} from '@aies/aies-models';

import { asArray, asNullableString, asNumber, asRecord, asString } from './wire';

/**
 * Whether the payload looks like an AIES API envelope.
 * @param value
 */
function isWrappedEnvelope(value: unknown): boolean {
  const record = asRecord(value);
  return record !== null && 'success' in record && 'data' in record;
}

/**
 * Laravel LengthAwarePaginator nested inside the envelope `data` field.
 * @param value
 */
export function isLaravelPaginator(value: unknown): boolean {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }

  return (
    Array.isArray(record['data']) &&
    ('current_page' in record ||
      'currentPage' in record ||
      'last_page' in record ||
      'lastPage' in record ||
      'per_page' in record ||
      'perPage' in record)
  );
}

/**
 * Map pagination from snake_case (preferred), legacy camelCase, or Laravel keys.
 * @param value
 */
export function normalizePagination(value: unknown): PaginationMetaModel | null {
  const record = asRecord(value);
  if (record === null) {
    return null;
  }

  const current_page = record['current_page'] ?? record['currentPage'];
  const per_page = record['per_page'] ?? record['perPage'];
  const total_items =
    record['total_items'] ?? record['totalItems'] ?? record['total'];
  const total_pages =
    record['total_pages'] ??
    record['totalPages'] ??
    record['last_page'] ??
    record['lastPage'];
  let has_next_page = record['has_next_page'] ?? record['hasNextPage'];
  let has_previous_page =
    record['has_previous_page'] ?? record['hasPreviousPage'];

  if (has_next_page == null) {
    const next_page_url = record['next_page_url'] ?? record['nextPageUrl'];
    has_next_page = next_page_url != null && next_page_url !== '';
  }

  if (has_previous_page == null) {
    const prev_page_url = record['prev_page_url'] ?? record['prevPageUrl'];
    has_previous_page = prev_page_url != null && prev_page_url !== '';
  }

  return {
    current_page: asNumber(current_page),
    per_page: asNumber(per_page),
    total_items: asNumber(total_items),
    total_pages: asNumber(total_pages),
    has_next_page: Boolean(has_next_page),
    has_previous_page: Boolean(has_previous_page),
  };
}

/**
 * Flatten a Laravel paginator in `data` into list payload + {@link PaginationMetaModel}.
 * @param raw
 */
export function unwrapLaravelPaginator<T>(raw: unknown): {
  data: T[] | null;
  pagination: PaginationMetaModel | null;
} {
  if (!isLaravelPaginator(raw)) {
    return {
      data: (raw as T[] | null | undefined) ?? null,
      pagination: null,
    };
  }

  const record = asRecord(raw);
  if (record === null) {
    return { data: null, pagination: null };
  }

  return {
    data: (record['data'] as T[] | null | undefined) ?? null,
    pagination: normalizePagination(record),
  };
}

/**
 * Coalesce a single error entry so missing field/code become `null`.
 * @param value
 */
function normalizeErrorDetail(value: unknown): ApiErrorDetailModel {
  const record = asRecord(value) ?? {};
  return {
    field: asString(record['field']) || null,
    message: asString(record['message']),
    code: asString(record['code']) || null,
  };
}

/**
 * Normalize any HTTP JSON body into a fully null-safe {@link ApiResponseModel}.
 *
 * Envelope fields use snake_case where the wire does (`status_code`,
 * pagination keys). Paginated list reads often embed a Laravel paginator in
 * `data` (`data.data` + totals) — that shape is flattened here so consumers
 * always see `data: T[]` and `pagination`.
 * @param raw
 */
export function normalize<T>(raw: unknown): ApiResponseModel<T> {
  if (isWrappedEnvelope(raw)) {
    const record = asRecord(raw);
    if (record !== null) {
      const success = record['success'];
      const status_code =
        record['status_code'] ?? record['statusCode'] ?? null;

      let pagination = normalizePagination(record['pagination']);
      let data = (record['data'] as T | null | undefined) ?? null;

      if (pagination === null && isLaravelPaginator(data)) {
        const unwrapped = unwrapLaravelPaginator<T>(data);
        data = (unwrapped.data as T | null | undefined) ?? null;
        pagination = unwrapped.pagination;
      }

      return {
        success: typeof success === 'boolean' ? success : Boolean(success),
        message: asNullableString(record['message']),
        data,
        errors: Array.isArray(record['errors'])
          ? asArray(record['errors']).map(normalizeErrorDetail)
          : null,
        pagination,
        status_code:
          status_code === null || status_code === undefined
            ? null
            : asNumber(status_code),
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
