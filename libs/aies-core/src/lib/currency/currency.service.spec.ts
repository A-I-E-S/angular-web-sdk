import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  CURRENCY_CREATE_PATH,
  CURRENCY_DELETE_PATH,
  CURRENCY_READ_PATH,
  CURRENCY_UPDATE_PATH,
} from './currency.mapper';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let getMock: jest.Mock;
  let postMock: jest.Mock;
  let putMock: jest.Mock;
  let deleteMock: jest.Mock;
  let clearCacheMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: 'Record fetched',
    data: [
      {
        id: 5,
        name: 'Naira',
        short_code: 'NGN',
        division_rate: '1',
        multiplication_rate: '1',
        is_local_currency_greater: false,
        active: true,
        deleted_at: null,
        created_at: null,
        updated_at: '2024-12-17T15:34:22.000000Z',
        payment_methods: [],
      },
    ],
    errors: null,
    pagination: {
      current_page: 1,
      per_page: 15,
      total_items: 5,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    },
    status_code: 200,
  };

  const writeEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: 'Record saved',
    data: [],
    errors: null,
    pagination: null,
    status_code: 200,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));
    postMock = jest.fn().mockReturnValue(of(writeEnvelope));
    putMock = jest.fn().mockReturnValue(of(writeEnvelope));
    deleteMock = jest.fn().mockReturnValue(of(writeEnvelope));
    clearCacheMock = jest.fn();

    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        {
          provide: ApiClient,
          useValue: {
            get: getMock,
            post: postMock,
            put: putMock,
            delete: deleteMock,
            clearCache: clearCacheMock,
          },
        },
      ],
    });

    service = TestBed.inject(CurrencyService);
  });

  it('defaults to paginated /currency/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(CURRENCY_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data?.[0]?.short_code).toBe('NGN');
      done();
    });
  });

  it('readPage forwards page, order, size, search, and date range', (done) => {
    service
      .readPage({
        page: 1,
        order: 'desc',
        size: 15,
        search: 'usd',
        from: '2026-01-01',
        to: '2026-01-31',
      })
      .subscribe(() => {
        expect(getMock).toHaveBeenCalledWith(CURRENCY_READ_PATH, {
          params: {
            page: 1,
            order: 'desc',
            size: 15,
            search: 'usd',
            from: '2026-01-01',
            to: '2026-01-31',
          },
          cacheTtlMs: undefined,
        });
        done();
      });
  });

  it('readAll hits /all with cache TTL and strips pagination params', (done) => {
    service.readAll({ page: 1, active: true }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${CURRENCY_READ_PATH}/all`, {
        params: { active: true },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById returns a single mapped currency', (done) => {
    service.readById(5).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${CURRENCY_READ_PATH}/5`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(5);
      expect(res.data?.name).toBe('Naira');
      done();
    });
  });

  it('create POSTs serialized flags and clears GET cache', (done) => {
    service
      .create({
        name: 'United States Dollar',
        short_code: 'USD',
        multiplication_rate: '1600',
        division_rate: '1400',
        active: true,
        is_naira_greater: false,
        payment_method_ids: [1, 2],
      })
      .subscribe((res) => {
        expect(postMock).toHaveBeenCalledWith(CURRENCY_CREATE_PATH, {
          name: 'United States Dollar',
          short_code: 'USD',
          multiplication_rate: '1600',
          division_rate: '1400',
          active: '1',
          is_naira_greater: '0',
          payment_method_ids: [1, 2],
        });
        expect(clearCacheMock).toHaveBeenCalled();
        expect(res.message).toBe('Record saved');
        done();
      });
  });

  it('update PUTs without name/short_code', (done) => {
    service
      .update({
        id: 12,
        multiplication_rate: '1600',
        division_rate: '1400',
        active: '1',
        is_naira_greater: '0',
        payment_method_ids: [1, 2],
      })
      .subscribe(() => {
        expect(putMock).toHaveBeenCalledWith(CURRENCY_UPDATE_PATH, {
          id: 12,
          multiplication_rate: '1600',
          division_rate: '1400',
          active: '1',
          is_naira_greater: '0',
          payment_method_ids: [1, 2],
        });
        expect(clearCacheMock).toHaveBeenCalled();
        done();
      });
  });

  it('remove DELETEs JSON { id }', (done) => {
    service.remove({ id: 12 }).subscribe(() => {
      expect(deleteMock).toHaveBeenCalledWith(CURRENCY_DELETE_PATH, { id: 12 });
      expect(clearCacheMock).toHaveBeenCalled();
      done();
    });
  });
});
