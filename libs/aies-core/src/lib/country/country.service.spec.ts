import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { COUNTRY_READ_PATH } from './country.mapper';
import { CountryService } from './country.service';

describe('CountryService', () => {
  let service: CountryService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 1,
        name: 'Afghanistan',
        iso3: 'AFG',
        iso2: 'AF',
        states: [{ name: 'Kabul', state_code: 'KAB' }],
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
        CountryService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(CountryService);
  });

  it('defaults to /public/country/read/all with cache TTL', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${COUNTRY_READ_PATH}/all`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.success).toBe(true);
      expect(res.data).toEqual([
        {
          id: 1,
          name: 'Afghanistan',
          iso3: 'AFG',
          iso2: 'AF',
          states: [{ name: 'Kabul', stateCode: 'KAB' }],
        },
      ]);
      done();
    });
  });

  it('readAll forwards optional query params', (done) => {
    service.readAll({ region: 'africa' }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${COUNTRY_READ_PATH}/all`, {
        params: { region: 'africa' },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById hits /public/country/read/{id}', (done) => {
    service.readById(1, { include: 'states' }).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${COUNTRY_READ_PATH}/1`, {
        params: { include: 'states' },
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.[0]?.id).toBe(1);
      done();
    });
  });
});
