import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { SHIPMENT_METHOD_READ_PATH } from './shipment-method.mapper';
import { ShipmentMethodService } from './shipment-method.service';

describe('ShipmentMethodService', () => {
  let service: ShipmentMethodService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 12,
        name: 'Africanies Air Expedited',
        slug: 'africanies_air_expedited_sfn',
        mode: 'sfn',
        sea_only: 'no',
        min_weight: '0.5',
        active: true,
        zone_values: {
          current_page: 1,
          data: [],
          per_page: 10,
          last_page: 1,
          total: 0,
        },
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
        ShipmentMethodService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(ShipmentMethodService);
  });

  it('defaults to /shipment_method/read/all with cache TTL', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${SHIPMENT_METHOD_READ_PATH}/all`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.success).toBe(true);
      expect(res.data?.[0]?.name).toBe('Africanies Air Expedited');
      expect(res.data?.[0]?.sea_only).toBe(false);
      expect(res.data?.[0]?.min_weight).toBe(0.5);
      done();
    });
  });

  it('readAll forwards optional query params', (done) => {
    service.readAll({ mode: 'sfn' }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${SHIPMENT_METHOD_READ_PATH}/all`, {
        params: { mode: 'sfn' },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById hits /shipment_method/read/{id}', (done) => {
    service.readById(12).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${SHIPMENT_METHOD_READ_PATH}/12`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.id).toBe(12);
      done();
    });
  });
});
