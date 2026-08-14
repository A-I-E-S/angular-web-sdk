import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { normalize } from '../http/normalize';
import { NOTIFICATION_READ_PATH, NOTIFICATION_UPDATE_PATH } from './notification.mapper';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let getMock: jest.Mock;
  let putMock: jest.Mock;

  const wireRow = {
    id: '315d916d-6302-486e-b98e-3e49c889277b',
    type: 'App\\Notifications\\DatabaseNotification',
    notifiable_type: 'App\\Models\\User',
    notifiable_id: 48,
    data: JSON.stringify({
      user_id: 48,
      title: 'User ETW Product updated',
      body: 'User ETW Product has been updated',
      link: 'https://test-admin-export.africaniestest.com/portal/customer/etw-products',
      image: null,
      external_link: false,
    }),
    read_at: null,
    created_at: '2026-08-13 15:30:45',
    updated_at: '2026-08-13 15:30:45',
  };

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [wireRow],
    errors: null,
    pagination: null,
    status_code: 200,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));
    putMock = jest.fn().mockReturnValue(of({ ...wireEnvelope, data: null }));

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: ApiClient, useValue: { get: getMock, put: putMock } },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  it('readPage unwraps Laravel paginator in data', (done) => {
    getMock.mockReturnValue(
      of(
        normalize({
          success: true,
          message: 'Notifications fetched successfully',
          data: {
            current_page: 1,
            data: [wireRow],
            last_page: 59,
            per_page: 10,
            total: 587,
            next_page_url: 'https://example.com?page=2',
            prev_page_url: null,
          },
          status_code: 200,
        }),
      ),
    );

    service.readPage({ page: 1, size: 10 }).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(NOTIFICATION_READ_PATH, {
        params: { page: 1, size: 10 },
      });
      expect(res.data).toHaveLength(1);
      expect(res.data?.[0]?.id).toBe(wireRow.id);
      expect(res.pagination).toEqual({
        current_page: 1,
        per_page: 10,
        total_items: 587,
        total_pages: 59,
        has_next_page: true,
        has_previous_page: false,
      });
      done();
    });
  });

  it('readPage defaults size to 30', (done) => {
    service.readPage({ page: 1 }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(NOTIFICATION_READ_PATH, {
        params: { page: 1, size: 30 },
      });
      done();
    });
  });

  it('readAll hits /user/notifications/read/all without cache', (done) => {
    service.readAll().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${NOTIFICATION_READ_PATH}/all`, {
        params: undefined,
      });
      expect(res.data?.[0]?.id).toBe(wireRow.id);
      expect(res.data?.[0]?.data.title).toBe('User ETW Product updated');
      expect(res.data?.[0]?.read_at).toBeNull();
      done();
    });
  });

  it('readOne maps a single UUID row', (done) => {
    getMock.mockReturnValue(
      of({
        ...wireEnvelope,
        data: wireRow,
      }),
    );

    service.readOne(wireRow.id).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(
        `${NOTIFICATION_READ_PATH}/${wireRow.id}`,
      );
      expect(res.data?.data.body).toBe('User ETW Product has been updated');
      done();
    });
  });

  it('markRead sends { id } for a single notification', (done) => {
    service.markRead(wireRow.id).subscribe(() => {
      expect(putMock).toHaveBeenCalledWith(NOTIFICATION_UPDATE_PATH, {
        id: wireRow.id,
      });
      done();
    });
  });

  it('markRead sends {} to mark all read', (done) => {
    service.markRead().subscribe(() => {
      expect(putMock).toHaveBeenCalledWith(NOTIFICATION_UPDATE_PATH, {});
      done();
    });
  });
});
