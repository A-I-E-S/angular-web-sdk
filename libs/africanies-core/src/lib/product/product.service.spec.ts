import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { PRODUCT_READ_PATH } from './product.mapper';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 6280,
        account_id: 78,
        hs_code: '010121000123',
        name: 'Indomie',
        value: 0,
        usage: 0,
        document_ids: null,
        etw_ids: null,
        active: true,
        is_external: true,
        document_details: [],
        etw_document_details: [],
        zone_product_required_documents: [],
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
        ProductService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(ProductService);
  });

  it('defaults to paginated /product/read without cache', (done) => {
    service.read().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(PRODUCT_READ_PATH, {
        params: { size: 15 },
        cacheTtlMs: undefined,
      });
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data?.[0]?.name).toBe('Indomie');
      done();
    });
  });

  it('readAll hits /all with cache TTL', (done) => {
    service.readAll({ active: true }).subscribe(() => {
      expect(getMock).toHaveBeenCalledWith(`${PRODUCT_READ_PATH}/all`, {
        params: { active: true },
        cacheTtlMs: 5 * 60_000,
      });
      done();
    });
  });

  it('readById returns a single mapped product', (done) => {
    service.readById(6280).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${PRODUCT_READ_PATH}/6280`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(6280);
      expect(res.data?.hs_code).toBe('010121000123');
      done();
    });
  });
});
