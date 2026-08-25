import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@africanies/africanies-models';

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
    pagination: {
      current_page: 1,
      per_page: 20,
      total_items: 1,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    },
    status_code: 200,
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

  it('defaults to paginated /public/country/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(COUNTRY_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(res.success).toBe(true);
      expect(res.data).toEqual([
        {
          id: 1,
          name: 'Afghanistan',
          iso3: 'AFG',
          iso2: 'AF',
          states: [{ name: 'Kabul', state_code: 'KAB' }],
        },
      ]);
      done();
    });
  });

  it('readPage forwards pagination params', (done) => {
    service.readPage({ page: 2, size: 10 }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(COUNTRY_READ_PATH, {
        params: { page: 2, size: 10 },
        cacheTtlMs: undefined,
      });
      done();
    });
  });

  it('readAll hits /all with cache TTL and strips pagination params', (done) => {
    service.readAll({ region: 'africa', page: 1 }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${COUNTRY_READ_PATH}/all`, {
        params: { region: 'africa' },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById returns a single mapped country', (done) => {
    service.readById(1, { include: 'states' }).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${COUNTRY_READ_PATH}/1`, {
        params: { include: 'states' },
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(1);
      expect(res.data?.name).toBe('Afghanistan');
      done();
    });
  });
});
