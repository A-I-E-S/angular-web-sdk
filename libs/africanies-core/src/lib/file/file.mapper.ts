import type {
  FileGenerateRequestModel,
  FileReadModel,
  SignedUploadInstructionModel,
} from '@africanies/africanies-models';

import { asRecord, asString } from '../http/wire';

/** File read path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const FILE_READ_PATH = '/file/read';

/** Signed upload generate path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const FILE_GENERATE_PATH = '/file/generate';

/** Query flag for multi-file waybill reads (`POST /file/read?multiple=yes`). */
export const FILE_READ_MULTIPLE_PARAM = 'yes';

/** Default S3 folder for delivery / item photos. */
export const FILE_UPLOAD_DEFAULT_FOLDER = 'images/items';

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

/**
 * Build a {@link FileGenerateRequestModel} from a Blob / File.
 *
 * @throws Error when the MIME type is not JPEG/JPG/PNG.
 */
export function toFileGenerateRequest(
  file: Blob,
  folder: string,
): FileGenerateRequestModel {
  const mime = file.type.toLowerCase();
  const extensionFromName =
    file instanceof File
      ? file.name.split('.').pop()?.toLowerCase()
      : undefined;

  if (mime === 'image/jpeg') {
    return {
      extension: extensionFromName === 'jpg' ? 'jpg' : 'jpeg',
      mime_type: 'image/jpeg',
      folder,
    };
  }

  if (mime === 'image/jpg') {
    return { extension: 'jpg', mime_type: 'image/jpg', folder };
  }

  if (mime === 'image/png') {
    return { extension: 'png', mime_type: 'image/png', folder };
  }

  throw new Error('Only JPEG, JPG, and PNG images can be uploaded.');
}

/**
 * Map and validate `POST /file/generate` envelope `data`.
 *
 * @param raw - Envelope `data` (expected array).
 * @param expectedCount - Number of files requested.
 * @param success - Envelope `success` flag.
 * @returns Validated instruction list.
 * @throws Error when the response shape is invalid.
 */
export function mapSignedUploadInstructions(
  raw: unknown,
  expectedCount: number,
  success = true,
): SignedUploadInstructionModel[] {
  if (!success || !Array.isArray(raw)) {
    throw new Error('Unable to prepare file uploads.');
  }

  if (raw.length !== expectedCount) {
    throw new Error(
      'The upload service returned an unexpected number of upload URLs.',
    );
  }

  return raw.map((entry) => mapSignedUploadInstruction(entry));
}

function mapSignedUploadInstruction(
  raw: unknown,
): SignedUploadInstructionModel {
  const record = asRecord(raw) ?? {};
  const headersRecord = asRecord(record['headers']) ?? {};
  const contentType = asString(
    headersRecord['Content-Type'] ?? headersRecord['content-type'],
  );
  const acl = asString(
    headersRecord['x-amz-acl'] ?? headersRecord['X-Amz-Acl'],
  );
  const method = asString(record['method']).toUpperCase();
  const inputName = asString(
    record['input_name'] ?? record['inputName'],
  ).toLowerCase();
  const uploadUrl = asString(
    record['upload_url'] ?? record['uploadUrl'],
  );
  const s3Key = asString(record['s3_key'] ?? record['s3Key']);
  const mime = asString(record['mime']) || contentType;

  if (
    method !== 'PUT' ||
    !uploadUrl ||
    !s3Key ||
    !contentType ||
    inputName !== 'file'
  ) {
    throw new Error(
      'The upload service returned an invalid upload instruction.',
    );
  }

  return {
    upload_url: uploadUrl,
    s3_key: s3Key,
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      ...(acl ? { 'x-amz-acl': acl } : {}),
    },
    mime,
    input_name: 'file',
  };
}
