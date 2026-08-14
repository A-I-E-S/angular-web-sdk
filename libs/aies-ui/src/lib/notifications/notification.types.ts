import type { Observable } from 'rxjs';

import type { PaginationMetaModel } from '@aies/aies-models';

/** Single in-app notification shown in {@link NotificationDrawerPanel}. */
export interface AiesNotification {
  /** Stable id for list tracking. */
  id: string;
  /** Primary line. */
  title: string;
  /** Optional supporting copy. */
  body?: string;
  /** ISO timestamp or preformatted label. */
  timestamp?: string;
  /** When true, renders with muted styling. */
  read?: boolean;
  /** Optional navigation target when the user selects the item. */
  link?: string;
  /** When true, {@link link} opens in a new browsing context. */
  externalLink?: boolean;
  /** Optional image URL for future rich rows. */
  image?: string | null;
}

/** One paginated inbox fetch for infinite scroll in the drawer. */
export interface NotificationPageResult {
  items: AiesNotification[];
  pagination: PaginationMetaModel | null;
}

/** Data passed when opening the notification drawer. */
export interface NotificationDrawerData {
  /** Drawer heading. */
  title?: string;
  /**
   * Optional seed list (e.g. page 1 already loaded for the header badge).
   * Ignored when {@link onLoadPage} is set — the drawer fetches page 1 itself.
   */
  notifications?: AiesNotification[];
  /** Paginated fetch — called for page 1 on open, then as the user scrolls. */
  onLoadPage?: (
    page: number,
  ) => Observable<NotificationPageResult> | Promise<NotificationPageResult>;
  /** Marks one notification read when the user taps Mark read or View. */
  onMarkRead?: (id: string) => Observable<unknown> | Promise<unknown> | void;
  /** Marks every notification read (`PUT …/update` with `{}`). */
  onMarkAllRead?: () => Observable<unknown> | Promise<unknown> | void;
}

/** Result emitted when the drawer closes. */
export interface NotificationDrawerResult {
  /** Id of the notification the user opened, if any. */
  selectedId?: string;
  /** Set when a single notification was marked read in this session. */
  markedReadId?: string;
  /** Set when all notifications were marked read in this session. */
  markedAllRead?: boolean;
}
