import type { FileReadModel } from '@aies/aies-models';

import { asRecord, asString } from '../http/wire';

/** File read path (relative to {@link AiesSdkConfig.baseUrl}). */
export const FILE_READ_PATH = '/file/read';

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
