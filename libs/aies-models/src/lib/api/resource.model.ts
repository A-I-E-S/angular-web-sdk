/**
 * Resource identifier convention used by many AIES list/detail endpoints
 * on paths shaped like `/{basePath}/{id?}`.
 *
 * - `null` — paginated list (page/size/order query params apply)
 * - `'all'` — full unpaginated list (pagination params ignored)
 * - `number` — single record by id (pagination params ignored)
 *
 * @example
 * ```ts
 * const listId: ResourceId = null;   // GET /widgets
 * const allId: ResourceId = 'all';   // GET /widgets/all
 * const oneId: ResourceId = 42;      // GET /widgets/42
 * ```
 */
export type ResourceId = number | 'all' | null;

/**
 * Optional query parameters for paginated resource list requests.
 *
 * Fields are optional (not `| null`) because omitted query params mean
 * "use the backend default" — distinct from sending an explicit null body field.
 */
export interface PaginationQueryParamsModel {
  /**
   * 1-based page index to request.
   * Omitted when the caller accepts the backend's default page.
   */
  page?: number;

  /**
   * Page size override.
   * Omitted when the caller accepts the backend's configured default
   * (e.g. `api.paginate.<resource>.pageSize`).
   */
  size?: number;

  /**
   * Sort / order expression understood by the target endpoint.
   * Omitted when default ordering is acceptable.
   */
  order?: string;
}
