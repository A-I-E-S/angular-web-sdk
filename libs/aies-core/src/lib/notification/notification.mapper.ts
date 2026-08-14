import type {
  NotificationInboxItemModel,
  NotificationModel,
  NotificationPayloadModel,
} from '@aies/aies-models';

/** User notifications read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const NOTIFICATION_READ_PATH = '/user/notifications/read';

/** Mark read endpoint (single `{ id }` or `{}` for all). */
export const NOTIFICATION_UPDATE_PATH = '/user/notifications/update';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

function asNullableBoolean(value: unknown): boolean | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '1' || trimmed === 'true') {
      return true;
    }
    if (trimmed === '0' || trimmed === 'false') {
      return false;
    }
  }
  return null;
}

/**
 * Parse the Laravel `data` column (JSON string or object) into
 * {@link NotificationPayloadModel}.
 * @param raw
 */
export function mapNotificationPayload(raw: unknown): NotificationPayloadModel {
  let record = asRecord(raw);

  if (typeof raw === 'string' && raw.trim()) {
    try {
      record = asRecord(JSON.parse(raw));
    } catch {
      record = null;
    }
  }

  const payload = record ?? {};
  return {
    user_id:
      payload['user_id'] == null && payload['userId'] == null
        ? null
        : asNumber(payload['user_id'] ?? payload['userId']),
    title: String(payload['title'] ?? ''),
    body: asNullableString(payload['body']),
    link: asNullableString(payload['link']),
    image: asNullableString(payload['image']),
    external_link: asNullableBoolean(
      payload['external_link'] ?? payload['externalLink'],
    ),
  };
}

/**
 * Map a wire notification row into {@link NotificationModel}.
 * @param raw
 */
export function mapNotification(raw: unknown): NotificationModel {
  const record = asRecord(raw) ?? {};

  return {
    id: String(record['id'] ?? ''),
    type: String(record['type'] ?? ''),
    notifiable_type: String(
      record['notifiable_type'] ?? record['notifiableType'] ?? '',
    ),
    notifiable_id: asNumber(record['notifiable_id'] ?? record['notifiableId']),
    data: mapNotificationPayload(record['data']),
    read_at: asNullableString(record['read_at'] ?? record['readAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
  };
}

/**
 * Map wire list payloads into {@link NotificationModel}[].
 * @param raw
 */
export function mapNotificationList(raw: unknown): NotificationModel[] {
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapNotification(entry));
  }

  const one = mapNotification(raw);
  return one.id ? [one] : [];
}

/**
 * Derive a header/drawer inbox item from a mapped notification.
 * @param notification
 */
export function mapNotificationInboxItem(
  notification: NotificationModel,
): NotificationInboxItemModel {
  const { data, read_at, created_at } = notification;

  return {
    id: notification.id,
    title: data.title,
    body: data.body ?? undefined,
    timestamp: created_at ?? undefined,
    read: read_at != null && read_at !== '',
    link: data.link ?? undefined,
    external_link: data.external_link ?? undefined,
    image: data.image,
  };
}
