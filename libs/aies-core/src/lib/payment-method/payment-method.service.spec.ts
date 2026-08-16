import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  PAYMENT_METHOD_READ_PATH,
  PAYMENT_METHOD_UPDATE_PATH,
} from './payment-method.mapper';
import { PaymentMethodService } from './payment-method.service';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let getMock: jest.Mock;
  let putMock: jest.Mock;
  let clearCacheMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: 'Record fetched',
    data: [
      {
        id: 4,
        name: 'Squad',
        model: 'App\\Models\\Squad',
        active: true,
        deleted_at: null,
        created_at: '2024-12-17T12:05:50.000000Z',
        updated_at: '2026-08-14T10:25:14.000000Z',
        currencies: [],
      },
    ],
    errors: null,
    pagination: {
      current_page: 1,
      per_page: 10,
      total_items: 4,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    },
    status_code: 200,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));
    putMock = jest.fn().mockReturnValue(
      of({
        success: true,
        message: 'Record updated',
        data: null,
        errors: null,
        pagination: null,
        status_code: 200,
      }),
    );
    clearCacheMock = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        PaymentMethodService,
        {
          provide: ApiClient,
          useValue: {
            get: getMock,
            put: putMock,
            clearCache: clearCacheMock,
          },
        },
      ],
    });

    service = TestBed.inject(PaymentMethodService);
  });

  it('defaults to paginated /payment_method/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(PAYMENT_METHOD_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data?.[0]?.name).toBe('Squad');
      done();
    });
  });

  it('readPage forwards page, size, search, and dates', (done) => {
    service
      .readPage({
        page: 1,
        size: 10,
        order: 'desc',
        search: 'pay',
        from: '2024-01-01',
        to: '2024-12-31',
      })
      .subscribe(() => {
        expect(getMock).toHaveBeenCalledWith(PAYMENT_METHOD_READ_PATH, {
          params: {
            page: 1,
            size: 10,
            order: 'desc',
            search: 'pay',
            from: '2024-01-01',
            to: '2024-12-31',
          },
          cacheTtlMs: undefined,
        });
        done();
      });
  });

  it('readAll hits /all with cache TTL and strips pagination params', (done) => {
    service.readAll({ page: 1, active: true }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${PAYMENT_METHOD_READ_PATH}/all`, {
        params: { active: true },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById returns a single mapped payment method', (done) => {
    service.readById(4).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${PAYMENT_METHOD_READ_PATH}/4`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(4);
      expect(res.data?.model).toBe('App\\Models\\Squad');
      done();
    });
  });

  it('update PUTs id/name/model with active as 1/0 and clears cache', (done) => {
    service
      .update({
        id: 1,
        name: 'Paystack',
        model: 'App\\Models\\Paystack',
        active: true,
      })
      .subscribe((res) => {
        expect(putMock).toHaveBeenCalledWith(PAYMENT_METHOD_UPDATE_PATH, {
          id: 1,
          name: 'Paystack',
          model: 'App\\Models\\Paystack',
          active: '1',
        });
        expect(clearCacheMock).toHaveBeenCalled();
        expect(res.message).toBe('Record updated');
        done();
      });
  });
});
