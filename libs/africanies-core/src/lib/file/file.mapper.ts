import type {
  FileGenerateExtension,
  FileGenerateMimeType,
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

interface FileGenerateKind {
  extension: FileGenerateExtension;
  mime_type: FileGenerateMimeType;
}

/** MIME → generate payload. Prefer this over guessing from the filename alone. */
const FILE_GENERATE_BY_MIME: Readonly<Record<string, FileGenerateKind>> = {
  'image/jpeg': { extension: 'jpeg', mime_type: 'image/jpeg' },
  'image/jpg': { extension: 'jpg', mime_type: 'image/jpg' },
  'image/png': { extension: 'png', mime_type: 'image/png' },
  'image/webp': { extension: 'webp', mime_type: 'image/webp' },
  'image/gif': { extension: 'gif', mime_type: 'image/gif' },
  'image/heic': { extension: 'heic', mime_type: 'image/heic' },
  'image/heif': { extension: 'heif', mime_type: 'image/heif' },
  'application/pdf': { extension: 'pdf', mime_type: 'application/pdf' },
  'application/msword': { extension: 'doc', mime_type: 'application/msword' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extension: 'docx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  'application/vnd.ms-excel': {
    extension: 'xls',
    mime_type: 'application/vnd.ms-excel',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extension: 'xlsx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  'text/csv': { extension: 'csv', mime_type: 'text/csv' },
  'text/plain': { extension: 'txt', mime_type: 'text/plain' },
  'application/zip': { extension: 'zip', mime_type: 'application/zip' },
  'application/x-zip-compressed': {
    extension: 'zip',
    mime_type: 'application/x-zip-compressed',
  },
};

/**
 * Filename extension → generate payload when `Blob.type` is empty/unknown
 * (common for some Office / HEIC picks).
 */
const FILE_GENERATE_BY_EXTENSION: Readonly<
  Record<string, FileGenerateKind>
> = {
  jpeg: { extension: 'jpeg', mime_type: 'image/jpeg' },
  jpg: { extension: 'jpg', mime_type: 'image/jpeg' },
  png: { extension: 'png', mime_type: 'image/png' },
  webp: { extension: 'webp', mime_type: 'image/webp' },
  gif: { extension: 'gif', mime_type: 'image/gif' },
  heic: { extension: 'heic', mime_type: 'image/heic' },
  heif: { extension: 'heif', mime_type: 'image/heif' },
  pdf: { extension: 'pdf', mime_type: 'application/pdf' },
  doc: { extension: 'doc', mime_type: 'application/msword' },
  docx: {
    extension: 'docx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  xls: { extension: 'xls', mime_type: 'application/vnd.ms-excel' },
  xlsx: {
    extension: 'xlsx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  csv: { extension: 'csv', mime_type: 'text/csv' },
  txt: { extension: 'txt', mime_type: 'text/plain' },
  zip: { extension: 'zip', mime_type: 'application/zip' },
};

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
 * Supports common image, document, and archive types. Product UIs should still
 * narrow picks with the file-upload `accept` attribute.
 *
 * @throws Error when the MIME type / filename extension is not supported.
 */
export function toFileGenerateRequest(
  file: Blob,
  folder: string,
): FileGenerateRequestModel {
  const mime = file.type.toLowerCase().trim();
  const extensionFromName =
    file instanceof File
      ? file.name.split('.').pop()?.toLowerCase()?.trim()
      : undefined;

  const fromMime = mime ? FILE_GENERATE_BY_MIME[mime] : undefined;
  if (fromMime) {
    // Prefer `.jpg` when the browser reports `image/jpeg` but the name says jpg.
    if (
      fromMime.mime_type === 'image/jpeg' &&
      extensionFromName === 'jpg'
    ) {
      return { extension: 'jpg', mime_type: 'image/jpeg', folder };
    }
    return { ...fromMime, folder };
  }

  const fromExt = extensionFromName
    ? FILE_GENERATE_BY_EXTENSION[extensionFromName]
    : undefined;
  if (fromExt) {
    return { ...fromExt, folder };
  }

  throw new Error(
    'Unsupported file type. Use a common image, PDF, Office, CSV, text, or ZIP file.',
  );
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
