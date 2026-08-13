import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  FileReadModel,
  FileReadRequestModel,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { FILE_READ_PATH, mapFileRead } from './file.mapper';

/**
 * File utility reads (`POST /file/read`).
 *
 * Resolves a storage `ref` into MIME type, optional base64/data-URI payload,
 * and a signed URL. Response `data` is a single {@link FileReadModel}
 * (not a list — no pagination). Auth may be required depending on the document.
 *
 * @example
 * ```ts
 * const files = inject(FileService);
 *
 * files.read('2d98ea54-2652-4f24-b524-645ef34e257a').subscribe((res) => {
 *   if (res.success) console.log(res.data?.mime_type, res.data?.url);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class FileService {
  private readonly api = inject(ApiClient);

  /**
   * Resolve one file reference.
   *
   * @param ref - Document / storage UUID.
   * @returns Normalized envelope with mapped {@link FileReadModel}.
   */
  read(ref: string): Observable<ApiResponseModel<FileReadModel>> {
    return this.readByBody({ ref });
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
      .post<unknown, FileReadRequestModel>(FILE_READ_PATH, body)
      .pipe(
        map((res) => ({
          ...res,
          data: res.data == null ? null : mapFileRead(res.data),
        })),
      );
  }
}
