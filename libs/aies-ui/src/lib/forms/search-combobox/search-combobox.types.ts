import type { IconName } from '@aies/aies-icons';
import type { Observable } from 'rxjs';

import type { ChipVariant } from '../../chip/chip.component';

/** Async lookup invoked as the user types (after debounce). */
export type SearchComboboxSearchFn<T> = (query: string) => Observable<T[]>;

/** Primary line in each dropdown row. */
export type SearchComboboxLabelFn<T> = (item: T) => string;

/** Optional secondary line under the label. */
export type SearchComboboxSubtitleFn<T> = (item: T) => string | undefined;

/** Optional trailing badge on the primary row (e.g. account type). */
export interface SearchComboboxBadge {
  label: string;
  variant?: ChipVariant;
  icon?: IconName;
}

export type SearchComboboxBadgeFn<T> = (
  item: T,
) => SearchComboboxBadge | null | undefined;

/** Optional leading mark beside the label (e.g. professional plan star). */
export type SearchComboboxMarkFn<T> = (item: T) => boolean;

/** Stable `@for` track key. */
export type SearchComboboxTrackFn<T> = (item: T) => string | number;
