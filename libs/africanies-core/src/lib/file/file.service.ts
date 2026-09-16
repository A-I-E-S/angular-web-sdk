import {
  HttpBackend,
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  concatMap,
  from,
  last,
  map,
  Observable,
  tap,
  toArray,
} from 'rxjs';

import type {
  ApiResponseModel,
  FileGenerateRequestModel,
  FileReadModel,
  FileReadRequestModel,
  SignedUploadInstructionModel,
} from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { asString } from '../http/wire';
import {
  FILE_GENERATE_PATH,
  FILE_READ_MULTIPLE_PARAM,
  FILE_READ_PATH,
  FILE_UPLOAD_DEFAULT_FOLDER,
  mapFileRead,
  mapFileReadList,
  mapSignedUploadInstructions,
  toFileGenerateRequest,
} from './file.mapper';

/**
 * Options for {@link FileService.uploadFiles}.
 */
export interface FileUploadOptions {
  /**
   * Optional 0–90 progress callback while files are PUT to S3.
   * Host apps can bind this to a progress bar; omitted by default.
   */
  onProgress?: (percent: number) => void;
}

/**
 * File utility reads (`POST /file/read`) and signed S3 uploads
 * (`POST /file/generate` + PUT to the presigned URL).
 *
 * Primary preview path when a record stores a `file_ref` string (shipments,
 * tracking items, waybills, KYC, etc.). Body `{ ref }` → `data` with
 * `mime_type` and `base_64` for `<img>` / PDF viewers.
 *
 * Document catalog previews use {@link DocumentService.readById} instead
 * (`GET /public/document/read/{id}` → `data.file_ref.base_64`).
 *
 * Uploads keep generate + S3 PUT in one method so callers cannot half-run
 * the flow. S3 uses a bare {@link HttpClient} over {@link HttpBackend} so
 * Authorization / `x-shipment-mode` never reach the bucket.
 *
 * @example
 * ```ts
 * const files = inject(FileService);
 *
 * files.read(item.file_ref).subscribe((res) => {
 *   if (res.success) console.log(res.data?.base_64);
 * });
 *
 * files.uploadFiles([photo], 'images/items').subscribe((keys) => {
 *   console.log(keys[0]); // s3_key for photos_s3_key
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly api = inject(ApiClient);
  /** Bypass app interceptors for presigned S3 PUTs. */
  private readonly s3Http = new HttpClient(inject(HttpBackend));

  /**
   * Resolve one file reference (`POST /file/read`, body `{ ref }`).
   *
   * @param ref - Storage / document UUID from `file_ref` on a record.
   * @returns Normalized envelope with mapped {@link FileReadModel}.
   */
  read(ref: string): Observable<ApiResponseModel<FileReadModel>> {
    return this.readByBody({ ref: asString(ref) });
  }

  /**
   * Resolve multiple files for one ref (`POST /file/read?multiple=yes`).
   *
   * E-commerce waybill flows may return several pages in `data[]`.
   *
   * @param ref - Storage reference token.
   * @returns Normalized envelope with mapped {@link FileReadModel}[].
   */
  readMultiple(ref: string): Observable<ApiResponseModel<FileReadModel[]>> {
    return this.readByBodyMultiple({ ref: asString(ref) });
  }

  /**
   * Resolve a file from an explicit request body.
   *
   * @param body - Wire body (`{ ref }`).
   * @returns Normalized envelope with mapped {@link FileReadModel}.
   */
  readByBody(
    body: FileReadRequestModel,
  ): Observable<ApiResponseModel<FileReadModel>> {
    return this.api
      .post<unknown, FileReadRequestModel>(FILE_READ_PATH, {
        ref: asString(body?.ref),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapFileRead(res.data),
        })),
      );
  }

  /**
   * Multi-file variant of {@link readByBody}.
   *
   * @param body - Wire body (`{ ref }`).
   * @returns Normalized envelope with mapped {@link FileReadModel}[].
   */
  readByBodyMultiple(
    body: FileReadRequestModel,
  ): Observable<ApiResponseModel<FileReadModel[]>> {
    return this.api
      .post<unknown, FileReadRequestModel>(
        FILE_READ_PATH,
        { ref: asString(body?.ref) },
        { params: { multiple: FILE_READ_MULTIPLE_PARAM } },
      )
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapFileReadList(res.data),
        })),
      );
  }

  /**
   * Generate signed upload URLs, PUT each file to S3, and return matching
   * `s3_key` values in the same order as `files`.
   *
   * @param files - Image blobs (JPEG / JPG / PNG only).
   * @param folder - Storage folder (default {@link FILE_UPLOAD_DEFAULT_FOLDER}).
   * @param options - Optional progress callback.
   * @returns Observable of S3 keys.
   */
  uploadFiles(
    files: Blob[],
    folder: string = FILE_UPLOAD_DEFAULT_FOLDER,
    options?: FileUploadOptions,
  ): Observable<string[]> {
    if (!files.length) {
      throw new Error('At least one file is required for upload.');
    }

    const requests = files.map((file) => toFileGenerateRequest(file, folder));

    return this.generateUploadInstructions(requests).pipe(
      concatMap((instructions) =>
        from(files).pipe(
          concatMap((file, index) =>
            this.uploadFileToS3(
              file,
              instructions[index],
              index,
              files.length,
              options?.onProgress,
            ).pipe(map(() => instructions[index].s3_key)),
          ),
          toArray(),
        ),
      ),
    );
  }

  private generateUploadInstructions(
    files: FileGenerateRequestModel[],
  ): Observable<SignedUploadInstructionModel[]> {
    return this.api
      .post<unknown, { files: FileGenerateRequestModel[] }>(
        FILE_GENERATE_PATH,
        { files },
        { toast: false },
      )
      .pipe(
        map((res) =>
          mapSignedUploadInstructions(
            res.data,
            files.length,
            res.success !== false,
          ),
        ),
      );
  }

  private uploadFileToS3(
    file: Blob,
    instruction: SignedUploadInstructionModel,
    fileIndex: number,
    totalFiles: number,
    onProgress?: (percent: number) => void,
  ): Observable<unknown> {
    const headers = this.getS3UploadHeaders(instruction);
    const request = new HttpRequest(
      instruction.method,
      instruction.upload_url,
      file,
      {
        headers,
        reportProgress: true,
      },
    );

    return this.s3Http.request(request).pipe(
      tap((event) => {
        if (!onProgress) {
          return;
        }
        const fileProgress =
          event.type === HttpEventType.UploadProgress && event.total
            ? Math.round((100 * event.loaded) / event.total)
            : event.type === HttpEventType.Response
              ? 100
              : 0;
        onProgress(
          Math.round(((fileIndex + fileProgress / 100) / totalFiles) * 90),
        );
      }),
      last((event) => event.type === HttpEventType.Response),
    );
  }

  private getS3UploadHeaders(
    instruction: SignedUploadInstructionModel,
  ): HttpHeaders {
    const contentType =
      instruction.headers?.['Content-Type'] || instruction.mime;

    if (!contentType) {
      throw new Error('The upload service did not provide a Content-Type.');
    }

    let headers = new HttpHeaders({
      'Content-Type': contentType,
    });

    const aclFromHeaders = instruction.headers?.['x-amz-acl'];
    if (aclFromHeaders) {
      return headers.set('x-amz-acl', aclFromHeaders);
    }

    const signedUrl = new URL(instruction.upload_url);
    const signedHeaders = signedUrl.searchParams
      .get('X-Amz-SignedHeaders')
      ?.toLowerCase()
      .split(';');

    if (signedHeaders?.includes('x-amz-acl')) {
      const acl = signedUrl.searchParams.get('x-amz-acl');

      if (!acl) {
        throw new Error(
          'The pre-signed S3 URL requires an ACL header but does not provide one.',
        );
      }

      headers = headers.set('x-amz-acl', acl);
    }

    return headers;
  }
}
