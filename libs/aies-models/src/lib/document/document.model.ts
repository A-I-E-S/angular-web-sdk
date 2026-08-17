/**
 * Document catalog shapes from public utility reads.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names match the wire (snake_case).
 */

/**
 * Document record from `GET /public/document/read/{id|all}`.
 *
 * List rows are usually metadata only. `readById(id)` may also populate
 * `mime_type`, `url`, or `base_64` for image / file preview in App Settings.
 * Authenticated upload/delete use `api/document/*`.
 */
export interface DocumentModel {
  id: number;
  name: string;
  description: string | null;
  /** Document type / category label when present on the wire. */
  type: string | null;
  mime_type: string | null;
  active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Signed URL when returned on single-record reads. */
  url: string | null;
  /**
   * Inline bytes as a data URI or raw base64 when returned on single reads.
   * Can be large — avoid binding in list UIs.
   */
  base_64: string | null;
}
