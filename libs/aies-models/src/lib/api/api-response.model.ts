/**
 * Field-level validation or business-rule error returned inside an API envelope.
 *
 * Used when `ApiResponseModel.errors` is populated so callers can map messages
 * back to form fields without parsing free-form `message` text.
 */
export interface ApiErrorDetail {
  /**
   * Form or payload field this error applies to.
   * `null` when the error is request-wide rather than tied to a single field.
   */
  field: string | null;

  /**
   * Human-readable explanation of the failure.
   * Always present; never null — backends must supply copy even for coded errors.
   */
  message: string;

  /**
   * Machine-readable error code for programmatic handling.
   * `null` when the backend only supplies a human message.
   */
  code: string | null;
}

/**
 * Pagination metadata accompanying list responses.
 *
 * Present on paginated list endpoints; absent (null on the envelope) for
 * single-resource fetches, unpaginated `'all'` lists, and non-list payloads.
 */
export interface PaginationMeta {
  /** 1-based index of the page currently represented by `data`. */
  currentPage: number;

  /** Maximum number of items requested per page. */
  perPage: number;

  /** Total number of matching items across all pages. */
  totalItems: number;

  /** Total number of pages given `perPage` and `totalItems`. */
  totalPages: number;

  /** Whether a subsequent page exists beyond `currentPage`. */
  hasNextPage: boolean;

  /** Whether a previous page exists before `currentPage`. */
  hasPreviousPage: boolean;
}

/**
 * Canonical API response envelope normalized by the SDK HTTP client.
 *
 * Every field is explicitly `| null` (never optional/undefined) so consumers
 * can rely on null-checks regardless of which subset the backend included.
 * Endpoints that omit `errors`, `pagination`, or `statusCode` are coalesced
 * to `null` during normalization rather than left as `undefined`.
 *
 * @typeParam T - Shape of the successful payload in `data`.
 *
 * @example
 * ```ts
 * const res: ApiResponseModel<User> = await firstValueFrom(
 *   apiClient.get<User>('/users/1'),
 * );
 * if (res.success && res.data !== null) {
 *   console.log(res.data);
 * }
 * ```
 */
export interface ApiResponseModel<T> {
  /**
   * Whether the operation completed successfully from the API's perspective.
   * Independent of HTTP status when the body still carries a business outcome.
   */
  success: boolean;

  /**
   * Optional human-readable status or error summary for the whole request.
   * `null` when the backend sends no top-level message (field errors may still exist).
   */
  message: string | null;

  /**
   * Successful payload, typed as `T`.
   * `null` on failure, or when the endpoint intentionally returns no body.
   */
  data: T | null;

  /**
   * Structured field/business errors.
   * `null` when the response has no error list (typical for success and some error shapes).
   */
  errors: ApiErrorDetail[] | null;

  /**
   * List pagination metadata.
   * `null` for non-paginated responses (single resource, `'all'` list, or no list).
   */
  pagination: PaginationMeta | null;

  /**
   * Application-level status code when the backend embeds one in the body
   * (e.g. public mode config sends `status_code` alongside success/data).
   * `null` when the envelope does not include a body status code.
   */
  statusCode: number | null;
}
