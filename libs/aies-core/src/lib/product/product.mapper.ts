import type { ProductModel } from '@aies/aies-models';

import { mapApiJsonList } from '../http/map-api-json';

/** Product read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const PRODUCT_READ_PATH = '/product/read';

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

function asNullableNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

function asNullableNumberArray(value: unknown): number[] | null {
  if (value == null) {
    return null;
  }
  if (!Array.isArray(value)) {
    return null;
  }
  return value.map((entry) => asNumber(entry));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry) => String(entry ?? ''));
}

/**
 * Map a wire product into {@link ProductModel} (snake_case preserved).
 * @param raw - Single product object from the API.
 * @returns Normalized {@link ProductModel}.
 */
export function mapProduct(raw: unknown): ProductModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    account_id: asNullableNumber(
      record['account_id'] ?? record['accountId'],
    ),
    product_category_id: asNullableNumber(
      record['product_category_id'] ?? record['productCategoryId'],
    ),
    hs_code: String(record['hs_code'] ?? record['hsCode'] ?? ''),
    hs_code_10: asNullableString(
      record['hs_code_10'] ?? record['hsCode10'],
    ),
    hs_code_8: asNullableString(record['hs_code_8'] ?? record['hsCode8']),
    hs_code_6: asNullableString(record['hs_code_6'] ?? record['hsCode6']),
    name: String(record['name'] ?? ''),
    value: asNumber(record['value']),
    usage: asNumber(record['usage']),
    document_ids: asNullableNumberArray(
      record['document_ids'] ?? record['documentIds'],
    ),
    etw_ids: asNullableNumberArray(record['etw_ids'] ?? record['etwIds']),
    active: Boolean(record['active']),
    is_external: Boolean(record['is_external'] ?? record['isExternal']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
    document_details: asStringArray(
      record['document_details'] ?? record['documentDetails'],
    ),
    etw_document_details: asStringArray(
      record['etw_document_details'] ?? record['etwDocumentDetails'],
    ),
    zone_product_required_documents: mapApiJsonList(
      record['zone_product_required_documents'] ??
        record['zoneProductRequiredDocuments'],
    ),
  };
}

/**
 * Map a list (or single object) payload into {@link ProductModel}[].
 * @param raw - `data` payload from `/product/read/{id|all}`.
 * @returns Mapped product list.
 */
export function mapProductList(raw: unknown): ProductModel[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapProduct(entry));
  }
  return [mapProduct(raw)];
}
