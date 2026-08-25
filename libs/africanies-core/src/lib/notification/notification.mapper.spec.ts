import {
  mapNotification,
  mapNotificationInboxItem,
  mapNotificationList,
  mapNotificationPayload,
} from './notification.mapper';

describe('notification.mapper', () => {
  it('parses stringified data payloads', () => {
    const model = mapNotification({
      id: '315d916d-6302-486e-b98e-3e49c889277b',
      type: 'App\\Notifications\\DatabaseNotification',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: 48,
      data: JSON.stringify({
        user_id: 48,
        title: 'User ETW Product updated',
        body: 'User ETW Product has been updated',
        link: 'https://example.com/inbox',
        image: null,
        external_link: false,
      }),
      read_at: null,
      created_at: '2026-08-13 15:30:45',
      updated_at: '2026-08-13 15:30:45',
    });

    expect(model.data.title).toBe('User ETW Product updated');
    expect(mapNotificationInboxItem(model)).toEqual({
      id: model.id,
      title: 'User ETW Product updated',
      body: 'User ETW Product has been updated',
      timestamp: '2026-08-13 15:30:45',
      read: false,
      link: 'https://example.com/inbox',
      external_link: false,
      image: null,
    });
  });

  it('accepts object data payloads', () => {
    const payload = mapNotificationPayload({
      title: 'Hello',
      external_link: true,
    });
    expect(payload.title).toBe('Hello');
    expect(payload.external_link).toBe(true);
  });

  it('never throws when list or row data is missing', () => {
    expect(mapNotificationList(undefined)).toEqual([]);
    expect(mapNotificationList(null)).toEqual([]);
    expect(mapNotification(undefined).id).toBe('');
    expect(mapNotificationInboxItem(undefined).title).toBe('');
    expect(mapNotificationPayload(undefined).title).toBe('');
  });
});
