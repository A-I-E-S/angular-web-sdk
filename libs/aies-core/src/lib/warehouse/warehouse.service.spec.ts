import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { WAREHOUSE_READ_PATH } from './warehouse.mapper';
import { WarehouseService } from './warehouse.service';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 37,
        name: 'Test China Fushan',
        api_enabled: '0',
        zip_code: '510620',
        country: {
          id: 46,
          name: 'China',
          iso3: 'CHN',
          iso2: 'CN',
          states: [],
        },
        state: null,
        active: true,
        partner: null,
      },
    ],
    errors: null,
    pagination: null,
    status_code: 200,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));

    TestBed.configureTestingModule({
      providers: [
        WarehouseService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(WarehouseService);
  });

  it('defaults to /warehouse/read/all with cache TTL', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${WAREHOUSE_READ_PATH}/all`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.name).toBe('Test China Fushan');
      expect(res.data?.[0]?.api_enabled).toBe(false);
      expect(res.data?.[0]?.zip_code).toBe('510620');
      done();
    });
  });

  it('readById hits /warehouse/read/{id}', (done) => {
    service.readById(37).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${WAREHOUSE_READ_PATH}/37`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.id).toBe(37);
      done();
    });
  });
});
