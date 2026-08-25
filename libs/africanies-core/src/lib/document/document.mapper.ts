import type { DocumentModel, FileReadModel } from '@africanies/africanies-models';

import { mapFileRead } from '../file/file.mapper';
import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** Public document read base path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const DOCUMENT_READ_PATH = '/public/document/read';

/**
 * Map nested or legacy flat preview fields into {@link FileReadModel}.
 * @param record - Document wire object.
 */
function mapDocumentFileRef(record: Record<string, unknown>): FileReadModel | null {
  const nested = asRecord(record['file_ref'] ?? record['fileRef']);
  if (nested !== null) {
    return mapFileRead(nested);
  }

  const mime_type = asNullableString(record['mime_type'] ?? record['mimeType']);
  const base_64 = asNullableString(record['base_64'] ?? record['base64']);
  const url = asNullableString(record['url']);
  if (mime_type === null && base_64 === null && url === null) {
    return null;
  }

  return mapFileRead({
    mime_type,
    base_64,
    url,
  });
}

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
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    file_ref: mapDocumentFileRef(record),
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
