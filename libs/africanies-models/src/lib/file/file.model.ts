/**
 * File read / signed-upload shapes from `POST /file/read` and `POST /file/generate`.
 *
 * Domain interfaces in `@africanies/africanies-models` use a `*Model` suffix.
 * Field names match the wire (snake_case).
 */

/**
 * Request body for {@link FileReadModel} fetches.
 */
export interface FileReadRequestModel {
  /** Storage / document reference UUID. */
  ref: string;
}

/**
 * One file payload from `POST /file/read`.
 *
 * Response `data` is this object (not a list). Prefer {@link FileReadModel.url}
 * for downloads when the signed URL is present; `base_64` is typically a data
 * URI (`data:{mime};base64,…`).
 */
export interface FileReadModel {
  /** MIME type (e.g. `"application/pdf"`). */
  mime_type: string;

  /**
   * Inline file bytes as a data URI or raw base64 string.
   * Can be large — avoid logging or binding the full value in UI lists.
   */
  base_64: string;

  /** Time-limited signed URL for the object (when provided). */
  url: string;
}

/**
 * Allowed extensions for {@link FileGenerateRequestModel}.
 * Hosts still filter with `accept` — this is the SDK generate allow-list.
 */
export type FileGenerateExtension =
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'heic'
  | 'heif'
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'csv'
  | 'txt'
  | 'zip';

/**
 * Allowed MIME types for {@link FileGenerateRequestModel}.
 * Hosts still filter with `accept` — this is the SDK generate allow-list.
 */
export type FileGenerateMimeType =
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/heic'
  | 'image/heif'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/csv'
  | 'text/plain'
  | 'application/zip'
  | 'application/x-zip-compressed';

/**
 * One entry in the `files` array for `POST /file/generate`.
 */
export interface FileGenerateRequestModel {
  extension: FileGenerateExtension;
  mime_type: FileGenerateMimeType;
  /** Storage folder prefix (e.g. `"images/items"`). */
  folder: string;
}

/**
 * One signed PUT instruction from `POST /file/generate` (`data[]`).
 */
export interface SignedUploadInstructionModel {
  upload_url: string;
  s3_key: string;
  method: 'PUT';
  headers: {
    'Content-Type': string;
    'x-amz-acl'?: string;
  };
  mime: string;
  input_name: 'file';
}
