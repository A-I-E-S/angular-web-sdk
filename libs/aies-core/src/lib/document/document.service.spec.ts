import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { DOCUMENT_READ_PATH } from './document.mapper';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let getMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: [
      {
        id: 7,
        name: 'Fumigation Certificate',
        description: null,
        type: 'certificate',
        mime_type: 'application/pdf',
        active: true,
        url: null,
        base_64: null,
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
        DocumentService,
        { provide: ApiClient, useValue: { get: getMock } },
      ],
    });

    service = TestBed.inject(DocumentService);
  });

  it('defaults to paginated /public/document/read without cache', (done) => {
    service.readPage({ page: 1, order: 'desc' }).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(DOCUMENT_READ_PATH, {
        params: { page: 1, size: 15, order: 'desc' },
        cacheTtlMs: undefined,
      });
      expect(res.data?.[0]?.name).toBe('Fumigation Certificate');
      done();
    });
  });

  it('readById hits /{id} with cache TTL', (done) => {
    service.readById(7).subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(`${DOCUMENT_READ_PATH}/7`, {
        params: undefined,
        cacheTtlMs: 5 * 60_000,
      });
      expect(res.data?.id).toBe(7);
      done();
    });
  });
});
