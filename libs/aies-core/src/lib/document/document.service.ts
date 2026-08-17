import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  DocumentModel,
  ResourceId,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from '../http/resource-path';
import {
  DOCUMENT_READ_PATH,
  mapDocument,
  mapDocumentList,
} from './document.mapper';

/** In-memory GET cache TTL for document reference dumps / by-id (5 minutes). */
const DOCUMENT_CACHE_TTL_MS = 5 * 60_000;

/**
 * Public document catalog reads (`GET /public/document/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention:
 * - `null` (default) → paginated page
 * - `'all'` → full list
 * - `number` → single {@link DocumentModel} (may include preview `url` / `base_64`)
 *
 * @example
 * ```ts
 * const documents = inject(DocumentService);
 *
 * documents.readPage({ page: 1 }).subscribe((res) => {
 *   console.log(res.data, res.pagination);
 * });
 * documents.readById(12).subscribe((res) => {
 *   console.log(res.data?.url ?? res.data?.base_64);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly api = inject(ApiClient);

  /** Paginated document page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel[]>>;

  /** Full document list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel[]>>;

  /** Single document — {@link ResourceId} number. */
  read(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel>>;

  read(
    id: ResourceId = null,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel | DocumentModel[]>> {
    return this.api
      .get<unknown>(buildResourcePath(DOCUMENT_READ_PATH, id), {
        params: buildResourceQueryParams(id, params),
        cacheTtlMs: resourceCacheTtlMs(id, DOCUMENT_CACHE_TTL_MS),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(id, res.data, mapDocument, mapDocumentList),
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * @param params
   */
  readPage(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single record — alias for {@link read}(id).
   * @param id
   * @param params
   */
  readById(
    id: number,
    params?: ResourceQueryParams,
  ): Observable<ApiResponseModel<DocumentModel>> {
    return this.read(id, params);
  }
}
