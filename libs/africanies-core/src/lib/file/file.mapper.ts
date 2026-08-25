import type { FileReadModel } from '@africanies/africanies-models';

import { asRecord, asString } from '../http/wire';

/** File read path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const FILE_READ_PATH = '/file/read';

/** Query flag for multi-file waybill reads (`POST /file/read?multiple=yes`). */
export const FILE_READ_MULTIPLE_PARAM = 'yes';

/**
 * Map wire `data` into {@link FileReadModel} (snake_case preserved).
 *
 * `POST /file/read` returns a single object in `data` (not a list).
 * If the wire unexpectedly sends a one-element array, the first entry is used.
 *
 * @param raw - Envelope `data` from `POST /file/read`.
 * @returns Normalized {@link FileReadModel}.
 */
export function mapFileRead(raw: unknown): FileReadModel {
  const entry = Array.isArray(raw) ? raw[0] : raw;
  const record = asRecord(entry) ?? {};
  return {
    mime_type: asString(record['mime_type'] ?? record['mimeType']),
    base_64: asString(record['base_64'] ?? record['base64']),
    url: asString(record['url']),
  };
}

/**
 * Map a list (or single object) payload into {@link FileReadModel}[].
 *
 * Used for `POST /file/read?multiple=yes` (e-commerce waybills).
 *
 * @param raw - Envelope `data` from multi-file reads.
 * @returns Mapped file list (empty when `raw` is null/undefined).
 */
export function mapFileReadList(raw: unknown): FileReadModel[] {
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapFileRead(entry));
  }
  if (raw == null) {
    return [];
  }
  return [mapFileRead(raw)];
}
