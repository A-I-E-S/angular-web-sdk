import {
  HttpBackend,
  HttpClient,
  HttpResponse,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { FILE_GENERATE_PATH, FILE_READ_PATH } from './file.mapper';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let postMock: jest.Mock;
  let httpMock: HttpTestingController;

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
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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

  it('uploadFiles rejects an empty file list', () => {
    expect(() => service.uploadFiles([])).toThrow(/At least one file/);
  });

  it('uploadFiles generates instructions then PUTs to S3 via HttpBackend', (done) => {
    const file = new File(['hello'], 'box.jpg', { type: 'image/jpeg' });
    const uploadUrl =
      'https://s3.example.com/bucket/key?X-Amz-SignedHeaders=host';
    postMock.mockReturnValue(
      of({
        success: true,
        message: 'ok',
        data: [
          {
            upload_url: uploadUrl,
            s3_key: 'images/items/box.jpg',
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpeg' },
            mime: 'image/jpeg',
            input_name: 'file',
          },
        ],
        errors: null,
        pagination: null,
        status_code: 200,
      }),
    );

    const progress: number[] = [];
    service
      .uploadFiles([file], 'images/items', {
        onProgress: (percent) => progress.push(percent),
      })
      .subscribe((keys) => {
        expect(keys).toEqual(['images/items/box.jpg']);
        expect(postMock).toHaveBeenCalledWith(
          FILE_GENERATE_PATH,
          {
            files: [
              {
                extension: 'jpg',
                mime_type: 'image/jpeg',
                folder: 'images/items',
              },
            ],
          },
          { toast: false },
        );
        expect(progress.length).toBeGreaterThan(0);
        done();
      });

    const req = httpMock.expectOne(uploadUrl);
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Content-Type')).toBe('image/jpeg');
    expect(req.request.body).toBe(file);
    req.flush(new HttpResponse({ status: 200, body: null }));
  });

  it('constructs an S3 HttpClient from HttpBackend', () => {
    expect(TestBed.inject(HttpBackend)).toBeTruthy();
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
