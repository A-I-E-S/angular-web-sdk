/**
 * Why a list screen is fetching.
 *
 * - `initial` — first paint (no rows yet).
 * - `focus` — tab/window became visible again.
 * - `refresh` — toolbar Refresh.
 * - `page` — pager page or size change.
 * - `mode` — {@link ShippingModeService} switched STN ↔ SFN.
 */
export type ListFetchReason =
  | 'initial'
  | 'focus'
  | 'refresh'
  | 'page'
  | 'mode';

/**
 * How to bind the list table while that fetch is in flight.
 *
 * - `loading` — body spinner. Use when there is no data, or the shipping
 *   mode changed (previous rows belong to the other mode — drop them).
 * - `pagination` — keep rows; pager spinner.
 * - `refreshing` — keep rows; refresh icon spins (focus / Refresh).
 */
export type ListFetchKind = 'loading' | 'pagination' | 'refreshing';

/**
 * Pick blocking vs keep-rows fetch for a list table.
 *
 * Body loading only when there is no initial data or the shipping mode
 * switched. Page/size keeps rows. Tab focus and Refresh keep rows.
 *
 * @param options.hasData - Rows from the *current* mode are already on screen.
 * @param options.reason - What triggered this fetch.
 * @returns Kind to map onto `loading` / `pageLoading` / `refreshing`.
 *
 * @example
 * ```ts
 * const kind = listFetchKind({
 *   hasData: this.rows().length > 0,
 *   reason: 'mode',
 * });
 * this.isLoading.set(kind === 'loading');
 * if (kind === 'loading') {
 *   this.rows.set([]);
 * }
 * ```
 */
export function listFetchKind(options: {
  hasData: boolean;
  reason: ListFetchReason;
}): ListFetchKind {
  if (!options.hasData || options.reason === 'mode') {
    return 'loading';
  }
  if (options.reason === 'page') {
    return 'pagination';
  }
  return 'refreshing';
}
