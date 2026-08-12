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
}

/** Data passed when opening the notification drawer. */
export interface NotificationDrawerData {
  /** Drawer heading. */
  title?: string;
  /** Items to list. */
  notifications: AiesNotification[];
}

/** Result emitted when the drawer closes. */
export interface NotificationDrawerResult {
  /** Id of the notification the user selected, if any. */
  selectedId?: string;
}
