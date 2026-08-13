import {
  HttpClient,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  map,
  Observable,
  of,
  retry,
  tap,
  throwError,
  timeout,
  timer,
} from 'rxjs';

import type {
  ApiResponseModel,
  PaginationQueryParamsModel,
  ResourceId,
} from '@aies/aies-models';

import { AIES_SDK_CONFIG } from '../config/aies-sdk.config';
import { ShippingModeService } from '../shipping/shipping-mode.service';
import { HttpResponseCache } from './http-cache';
import { normalize } from './normalize';

/**
 * Shared request options for {@link ApiClient} verbs.
 *
 * ## In-memory GET caching (`cacheTtlMs`)
 *
 * Optional short-TTL cache for identical GET URLs. See {@link HttpResponseCache}
 * for when **not** to enable it (volatile data, auth-sensitive payloads,
 * post-mutation lists). Prefer TanStack Query for app-level caching.
 */
export interface ApiRequestOptions {
  /**
   * `'wrapped'` (default) → {@link ApiResponseModel}; `'raw'` → payload `T`.
   * Both paths still run through {@link normalize} so null-safety is consistent.
   */
  responseMode?: 'wrapped' | 'raw';

  /** Extra headers; override {@link AiesSdkConfig.defaultHeaders} on conflict. */
  headers?: Record<string, string>;

  /** Query string values; `null` / `undefined` entries are omitted. */
  params?: Record<string, string | number | boolean | null | undefined>;

  /**
   * When set on GET, serve/store the normalized result in the in-memory cache
   * for this many milliseconds. Omit for uncached reads (the common case).
   */
  cacheTtlMs?: number;
}

type ResponseMode = NonNullable<ApiRequestOptions['responseMode']>;

/**
 * Endpoint-agnostic HTTP façade over Angular {@link HttpClient}.
 *
 * Domain services own path strings — this client never hard-codes product
 * routes (except helpers like {@link getResource} that only know conventions).
 *
 * Features:
 * - `responseMode` overloads (`wrapped` | `raw`)
 * - {@link normalize} on every body
 * - Exponential-backoff retry (max 3) for **GET only**
 * - Optional per-GET TTL cache via `cacheTtlMs`
 *
 * @example
 * ```ts
 * const api = inject(ApiClient);
 * api.get<User>('/users/1').subscribe((res) => {
 *   if (res.success) console.log(res.data);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AIES_SDK_CONFIG);
  private readonly shippingMode = inject(ShippingModeService);
  private readonly cache = new HttpResponseCache();

  /**
   * GET with wrapped {@link ApiResponseModel} (default).
   *
   * @typeParam T - Payload type inside `data`.
   */
  get<T>(
    path: string,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * GET returning the bare payload type (after normalize + unwrap).
   *
   * @typeParam T - Unwrapped payload type.
   */
  get<T>(
    path: string,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  get<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * POST with wrapped envelope (default).
   *
   * @typeParam T - Payload type inside `data`.
   * @typeParam TBody - JSON body type.
   */
  post<T, TBody = unknown>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * POST returning bare payload `T`.
   *
   * @typeParam T - Unwrapped payload type.
   * @typeParam TBody - JSON body type.
   */
  post<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  post<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * PATCH with wrapped envelope (default).
   *
   * @typeParam T - Payload type inside `data`.
   * @typeParam TBody - JSON body type.
   */
  patch<T, TBody = unknown>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * PATCH returning bare payload `T`.
   *
   * @typeParam T - Unwrapped payload type.
   * @typeParam TBody - JSON body type.
   */
  patch<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  patch<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * DELETE with wrapped envelope (default).
   *
   * @typeParam T - Payload type inside `data`.
   */
  delete<T>(
    path: string,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * DELETE returning bare payload `T`.
   *
   * @typeParam T - Unwrapped payload type.
   */
  delete<T>(
    path: string,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  delete<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /**
   * Paginated list: `GET {basePath}` with optional page/size/order.
   * Always attaches `mode` from {@link ShippingModeService} (in addition to
   * the `x-shipment-mode` header from {@link shipmentModeInterceptor}).
   *
   * @typeParam T - Element type of the list.
   *
   * @example
   * ```ts
   * // Paginated list — id null
   * api.getResource<Shipment>('shipments', null, { page: 1, size: 20 })
   *   .subscribe((res) => console.log(res.data, res.pagination));
   * ```
   */
  getResource<T>(
    basePath: string,
    id: null,
    query?: PaginationQueryParamsModel,
  ): Observable<ApiResponseModel<T[]>>;

  /**
   * Full unpaginated list: `GET {basePath}/all` (pagination query ignored).
   *
   * @typeParam T - Element type of the list.
   *
   * @example
   * ```ts
   * // Full list — id 'all'
   * api.getResource<Port>('ports', 'all').subscribe((res) => {
   *   console.log(res.data); // Port[] | null
   * });
   * ```
   */
  getResource<T>(
    basePath: string,
    id: 'all',
    query?: PaginationQueryParamsModel,
  ): Observable<ApiResponseModel<T[]>>;

  /**
   * Single record: `GET {basePath}/{id}` (pagination query ignored).
   *
   * @typeParam T - Record type.
   *
   * @example
   * ```ts
   * // Single record — numeric id
   * api.getResource<Shipment>('shipments', 42).subscribe((res) => {
   *   console.log(res.data); // Shipment | null
   * });
   * ```
   */
  getResource<T>(
    basePath: string,
    id: number,
    query?: PaginationQueryParamsModel,
  ): Observable<ApiResponseModel<T>>;

  getResource<T>(
    basePath: string,
    id: ResourceId,
    query?: PaginationQueryParamsModel,
  ): Observable<ApiResponseModel<T | T[]>> {
    const trimmed = basePath.replace(/\/+$/, '');
    const path = id === null ? trimmed : `${trimmed}/${id}`;

    const params: Record<string, string | number | boolean | null | undefined> =
      {
        // Always send mode as a query param — some endpoints require it even
        // though shipmentModeInterceptor already sets x-shipment-mode.
        mode: this.shippingMode.mode(),
      };

    // Pagination applies only to the paginated-list shape (id === null).
    if (id === null && query) {
      if (query.page !== undefined) {
        params['page'] = query.page;
      }
      if (query.size !== undefined) {
        params['size'] = query.size;
      }
      if (query.order !== undefined) {
        params['order'] = query.order;
      }
    }

    return this.get<T | T[]>(path, { params });
  }

  /**
   * Clears the in-memory GET cache (e.g. on logout).
   */
  clearCache(): void {
    this.cache.clear();
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options: ApiRequestOptions,
  ): Observable<ApiResponseModel<T> | T> {
    const responseMode: ResponseMode = options.responseMode ?? 'wrapped';
    const url = this.resolveUrl(path);
    const hasBody = method === 'POST' || method === 'PATCH';
    const headers = this.buildHeaders(options.headers, hasBody);
    const params = this.buildParams(options.params);
    const cacheKey =
      method === 'GET' && options.cacheTtlMs != null
        ? `${method} ${url}?${params.toString()}`
        : null;

    if (cacheKey) {
      const hit = this.cache.get<ApiResponseModel<T>>(cacheKey);
      if (hit !== null) {
        return of(this.unwrap(hit, responseMode));
      }
    }

    let req$: Observable<unknown>;
    switch (method) {
      case 'GET':
        req$ = this.http.get(url, { headers, params });
        break;
      case 'POST':
        req$ = this.http.post(url, body, { headers, params });
        break;
      case 'PATCH':
        req$ = this.http.patch(url, body, { headers, params });
        break;
      case 'DELETE':
        req$ = this.http.delete(url, { headers, params });
        break;
    }

    // Retry only idempotent GETs — mutating verbs must not replay on timeout.
    if (method === 'GET') {
      req$ = req$.pipe(
        retry({
          count: 3,
          delay: (_error, retryCount) =>
            // Exponential backoff: 1s, 2s, 4s between attempts.
            timer(2 ** (retryCount - 1) * 1000),
        }),
      );
    }

    if (this.config.timeout != null) {
      req$ = req$.pipe(
        timeout({
          each: this.config.timeout,
          with: () =>
            throwError(
              () =>
                new Error(
                  `AIES API request timed out after ${this.config.timeout}ms: ${method} ${url}`,
                ),
            ),
        }),
      );
    }

    return req$.pipe(
      map((raw) => normalize<T>(raw)),
      tap((envelope) => {
        if (cacheKey && options.cacheTtlMs != null) {
          this.cache.set(cacheKey, envelope, options.cacheTtlMs);
        }
      }),
      map((envelope) => this.unwrap(envelope, responseMode)),
    );
  }

  private unwrap<T>(
    envelope: ApiResponseModel<T>,
    responseMode: ResponseMode,
  ): ApiResponseModel<T> | T {
    if (responseMode === 'raw') {
      // Callers opting into raw want the payload; null stays null-compatible via cast.
      return envelope.data as T;
    }
    return envelope;
  }

  private resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const base = this.config.baseUrl.replace(/\/+$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${base}${suffix}`;
  }

  private buildHeaders(
    extra?: Record<string, string>,
    withJsonContentType = false,
  ): HttpHeaders {
    let headers = new HttpHeaders({
      Accept: 'application/json',
      ...(this.config.defaultHeaders ?? {}),
      ...(extra ?? {}),
    });
    // Only set JSON content-type when sending a body; avoid spurious GET headers.
    if (withJsonContentType && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  private buildParams(
    params?: Record<string, string | number | boolean | null | undefined>,
  ): HttpParams {
    let httpParams = new HttpParams();
    if (!params) {
      return httpParams;
    }
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
