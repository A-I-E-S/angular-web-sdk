import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { FILE_READ_PATH } from './file.mapper';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let postMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: 'success',
    data: {
      mime_type: 'application/pdf',
      base_64: 'data:application/pdf;base64,JVBERi0=',
      url: 'https://example.com/doc.pdf',
    },
    errors: null,
    pagination: null,
    status_code: 200,
  };

  beforeEach(() => {
    postMock = jest.fn().mockReturnValue(of(wireEnvelope));

    TestBed.configureTestingModule({
      providers: [
        FileService,
        { provide: ApiClient, useValue: { post: postMock } },
      ],
    });

    service = TestBed.inject(FileService);
  });

  it('POSTs /file/read with { ref } and maps a single FileReadModel', (done) => {
    const ref = '2d98ea54-2652-4f24-b524-645ef34e257a';
    service.read(ref).subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(FILE_READ_PATH, { ref });
      expect(res.data?.mime_type).toBe('application/pdf');
      expect(res.data?.url).toContain('doc.pdf');
      done();
    });
  });

  it('readByBody posts the given body', (done) => {
    service.readByBody({ ref: 'abc' }).subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(FILE_READ_PATH, { ref: 'abc' });
      expect(res.data?.mime_type).toBe('application/pdf');
      done();
    });
  });

  it('readMultiple posts with multiple=yes', (done) => {
    service.readMultiple('waybill-ref').subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(
        FILE_READ_PATH,
        { ref: 'waybill-ref' },
        { params: { multiple: 'yes' } },
      );
      expect(res.data?.[0]?.mime_type).toBe('application/pdf');
      done();
    });
  });
});
