import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { PLAN_READ_PATH } from './plan.mapper';
import { PlanService } from './plan.service';

describe('PlanService', () => {
  let service: PlanService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 1,
        name: 'Starter',
        active: true,
        packages: [{ id: 2, name: 'Box', discount: '10%', active: true }],
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
        PlanService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(PlanService);
  });

  it('defaults to paginated /public/plan/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(PLAN_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(res.data?.[0]?.packages?.[0]?.name).toBe('Box');
      done();
    });
  });

  it('readAll hits /all with cache TTL', (done) => {
    service.readAll().subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${PLAN_READ_PATH}/all`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });
});
