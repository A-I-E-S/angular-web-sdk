import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  FileReadModel,
  FileReadRequestModel,
} from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { asString } from '../http/wire';
import {
  FILE_READ_MULTIPLE_PARAM,
  FILE_READ_PATH,
  mapFileRead,
  mapFileReadList,
} from './file.mapper';

/**
 * File utility reads (`POST /file/read`).
 *
 * Primary preview path when a record stores a `file_ref` string (shipments,
 * tracking items, waybills, KYC, etc.). Body `{ ref }` → `data` with
 * `mime_type` and `base_64` for `<img>` / PDF viewers.
 *
 * Document catalog previews use {@link DocumentService.readById} instead
 * (`GET /public/document/read/{id}` → `data.file_ref.base_64`).
 *
 * @example
 * ```ts
 * const files = inject(FileService);
 *
 * files.read(item.file_ref).subscribe((res) => {
 *   if (res.success) console.log(res.data?.base_64);
 * });
 *
 * files.readMultiple(waybillRef).subscribe((res) => {
 *   console.log(res.data?.map((f) => f.mime_type));
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly api = inject(ApiClient);

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
}
