import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { ZONE_READ_PATH } from './zone.mapper';
import { ZoneService } from './zone.service';

describe('ZoneService', () => {
  let service: ZoneService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 1,
        name: 'R',
        type: 'standard',
        active: true,
        deleted_at: null,
        created_at: '2024-12-17T12:05:49.000000Z',
        updated_at: null,
      },
    ],
    errors: null,
    pagination: null,
    statusCode: 200,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));

    TestBed.configureTestingModule({
      providers: [
        ZoneService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(ZoneService);
  });

  it('defaults to /zone/read/records/all with cache TTL', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${ZONE_READ_PATH}/all`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.name).toBe('R');
      expect(res.data?.[0]?.createdAt).toBe('2024-12-17T12:05:49.000000Z');
      done();
    });
  });

  it('readById hits /zone/read/records/{id}', (done) => {
    service.readById(1).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${ZONE_READ_PATH}/1`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.id).toBe(1);
      done();
    });
  });
});
