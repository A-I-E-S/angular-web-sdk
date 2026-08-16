import type {
  NotificationInboxItemModel,
  NotificationModel,
  NotificationPayloadModel,
} from '@aies/aies-models';

import {
  asNullableBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** User notifications read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const NOTIFICATION_READ_PATH = '/user/notifications/read';

/** Mark read endpoint (single `{ id }` or `{}` for all). */
export const NOTIFICATION_UPDATE_PATH = '/user/notifications/update';

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
  const userId = payload['user_id'] ?? payload['userId'];
  return {
    user_id: userId == null ? null : asNumber(userId),
    title: asString(payload['title']),
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
    id: asString(record['id']),
    type: asString(record['type']),
    notifiable_type: asString(
      record['notifiable_type'] ?? record['notifiableType'],
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
  return mapList(raw, mapNotification).filter((row) => row.id !== '');
}

/**
 * Derive a header/drawer inbox item from a mapped notification.
 * @param notification
 */
export function mapNotificationInboxItem(
  notification: NotificationModel | null | undefined,
): NotificationInboxItemModel {
  const row = notification ?? mapNotification(null);
  const data = row.data ?? mapNotificationPayload(null);

  return {
    id: asString(row.id),
    title: asString(data.title),
    body: data.body ?? undefined,
    timestamp: row.created_at ?? undefined,
    read: row.read_at != null && row.read_at !== '',
    link: data.link ?? undefined,
    external_link: data.external_link ?? undefined,
    image: data.image,
  };
}
