import type { DocumentModel } from '@aies/aies-models';

import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** Public document read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const DOCUMENT_READ_PATH = '/public/document/read';

/**
 * Map a wire document into {@link DocumentModel} (snake_case preserved).
 * @param raw - Single document object from the API.
 * @returns Normalized {@link DocumentModel}.
 */
export function mapDocument(raw: unknown): DocumentModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    description: asNullableString(record['description']),
    type: asNullableString(record['type']),
    mime_type: asNullableString(record['mime_type'] ?? record['mimeType']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    url: asNullableString(record['url']),
    base_64: asNullableString(record['base_64'] ?? record['base64']),
  };
}

/**
 * Map a list (or single object) payload into {@link DocumentModel}[].
 * @param raw - `data` payload from `/public/document/read/{id|all}`.
 * @returns Mapped document list.
 */
export function mapDocumentList(raw: unknown): DocumentModel[] {
  return mapList(raw, mapDocument);
}
