import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { SERVICE_READ_PATH } from './service.mapper';
import { ServiceService } from './service.service';

describe('ServiceService', () => {
  let service: ServiceService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 3,
        name: 'Box Storage',
        description: null,
        model: 'App\\Models\\BoxStorage',
        active: true,
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
        ServiceService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(ServiceService);
  });

  it('defaults to paginated /public/service/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(SERVICE_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data?.[0]?.name).toBe('Box Storage');
      done();
    });
  });

  it('readAll hits /all with cache TTL', (done) => {
    service.readAll({ search: 'box' }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${SERVICE_READ_PATH}/all`, {
        params: { search: 'box' },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById returns a single mapped service', (done) => {
    service.readById(3).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${SERVICE_READ_PATH}/3`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(3);
      done();
    });
  });
});
