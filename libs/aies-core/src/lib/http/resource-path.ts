import type {
  PaginationQueryParamsModel,
  ResourceId,
} from '@aies/aies-models';

/**
 * Optional query bag for {@link ResourceId} GETs.
 *
 * `page` / `size` / `order` apply only when `id` is `null` (paginated list).
 * Extra keys are always forwarded (filters, includes, etc.).
 */
export type ResourceQueryParams = PaginationQueryParamsModel &
  Record<string, string | number | boolean | null | undefined>;

/**
 * Build a path for the AIES list/detail `ResourceId` convention.
 *
 * | `id` | Path |
 * |------|------|
 * | `null` | `{basePath}` — paginated |
 * | `'all'` | `{basePath}/all` — full list |
 * | `number` | `{basePath}/{id}` — single record |
 *
 * @param basePath - Endpoint base (e.g. `/product/read`).
 * @param id - {@link ResourceId}; defaults to `null` (paginated).
 * @returns Absolute-or-relative path segment for {@link ApiClient.get}.
 *
 * @example
 * ```ts
 * buildResourcePath('/product/read')        // '/product/read'
 * buildResourcePath('/product/read', 'all') // '/product/read/all'
 * buildResourcePath('/product/read', 42)    // '/product/read/42'
 * ```
 */
export function buildResourcePath(
  basePath: string,
  id: ResourceId = null,
): string {
  const trimmed = basePath.replace(/\/+$/, '');
  return id === null ? trimmed : `${trimmed}/${id}`;
}

/**
 * Build query params for a {@link ResourceId} request.
 *
 * Pagination fields (`page`, `size`, `order`) are included only when
 * `id === null`. Other keys are always passed through.
 *
 * @param id - Active resource id mode.
 * @param params - Optional pagination + filter bag.
 * @returns Params object for {@link ApiClient}, or `undefined` when empty.
 */
export function buildResourceQueryParams(
  id: ResourceId,
  params?: ResourceQueryParams,
): Record<string, string | number | boolean | null | undefined> | undefined {
  if (params == null) {
    return undefined;
  }

  const { page, size, order, ...rest } = params;
  const out: Record<string, string | number | boolean | null | undefined> = {
    ...rest,
  };

  if (id === null) {
    if (page !== undefined) {
      out['page'] = page;
    }
    if (size !== undefined) {
      out['size'] = size;
    }
    if (order !== undefined) {
      out['order'] = order;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * In-memory GET cache TTL for reference reads.
 *
 * Paginated lists (`id === null`) are never cached — page contents change.
 * `'all'` and by-id may use a short TTL for stable catalogs.
 *
 * @param id - Active resource id mode.
 * @param ttlMs - Desired TTL for stable reads.
 * @returns TTL to pass to {@link ApiClient}, or `undefined` to skip cache.
 */
export function resourceCacheTtlMs(
  id: ResourceId,
  ttlMs: number,
): number | undefined {
  return id === null ? undefined : ttlMs;
}

/**
 * Map wire `data` according to {@link ResourceId} shape.
 *
 * - `null` / `'all'` → list mapper → `T[]`
 * - `number` → one mapper → `T` (first element if the wire sent an array)
 *
 * @typeParam T - Domain model type.
 * @param id - Active resource id mode.
 * @param raw - Envelope `data` payload.
 * @param mapOne - Mapper for a single record.
 * @param mapMany - Mapper for a list (or single object coerced to list).
 * @returns Mapped payload, or `null` when wire data is nullish / empty by-id.
 */
export function mapResourcePayload<T>(
  id: ResourceId,
  raw: unknown,
  mapOne: (raw: unknown) => T,
  mapMany: (raw: unknown) => T[],
): T | T[] | null {
  if (raw == null) {
    return null;
  }

  if (typeof id === 'number') {
    const item = Array.isArray(raw) ? raw[0] : raw;
    return item == null ? null : mapOne(item);
  }

  return mapMany(raw);
}
