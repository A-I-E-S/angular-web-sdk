import type { ProductModel } from '@aies/aies-models';

import { mapApiJsonList } from '../http/map-api-json';
import {
  asBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
} from '../http/wire';

/** Product read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const PRODUCT_READ_PATH = '/product/read';

function asNullableNumberArray(value: unknown): number[] | null {
  if (value == null || !Array.isArray(value)) {
    return null;
  }
  return mapArray(value, (entry) => asNumber(entry));
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
    account_id: asNullableNumber(record['account_id'] ?? record['accountId']),
    product_category_id: asNullableNumber(
      record['product_category_id'] ?? record['productCategoryId'],
    ),
    hs_code: asString(record['hs_code'] ?? record['hsCode']),
    hs_code_10: asNullableString(record['hs_code_10'] ?? record['hsCode10']),
    hs_code_8: asNullableString(record['hs_code_8'] ?? record['hsCode8']),
    hs_code_6: asNullableString(record['hs_code_6'] ?? record['hsCode6']),
    name: asString(record['name']),
    value: asNumber(record['value']),
    usage: asNumber(record['usage']),
    document_ids: asNullableNumberArray(
      record['document_ids'] ?? record['documentIds'],
    ),
    etw_ids: asNullableNumberArray(record['etw_ids'] ?? record['etwIds']),
    active: asBoolean(record['active']),
    is_external: asBoolean(record['is_external'] ?? record['isExternal']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    document_details: mapArray(
      record['document_details'] ?? record['documentDetails'],
      (entry) => asString(entry),
    ),
    etw_document_details: mapArray(
      record['etw_document_details'] ?? record['etwDocumentDetails'],
      (entry) => asString(entry),
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
  return mapList(raw, mapProduct);
}
