import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import {
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
  timeout,
} from 'rxjs';

import {
  type ApiResponseModel,
  DEFAULT_PAGE_SIZE,
  type PaginationQueryParamsModel,
  type ResourceId,
  type ShippingMode,
} from '@africanies/africanies-models';

import { AFRICANIES_SDK_CONFIG } from '../config/africanies-sdk.config';
import { ShippingModeService } from '../shipping/shipping-mode.service';
import { formatApiErrorMessage } from './api-error-message';
import { HttpResponseCache } from './http-cache';
import { normalize } from './normalize';
import {
  resolveApiRequestContext,
  resolveRequestShippingMode,
} from './resolve-api-request-context';
import { buildResourcePath } from './resource-path';
import type { ToastHttpOptions } from './toast-http.context';

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

  /** Extra headers; override {@link AfricaniesSdkConfig.defaultHeaders} on conflict. */
  headers?: Record<string, string>;

  /** Query string values; `null` / `undefined` / `''` entries are omitted. */
  params?: Record<string, string | number | boolean | null | undefined>;

  /**
   * When set on GET, serve/store the normalized result in the in-memory cache
   * for this many milliseconds. Omit for uncached reads (the common case).
   */
  cacheTtlMs?: number;

  /**
   * HTTP toast tagging for this request (via {@link httpToastInterceptor}).
   *
   * - Omitted — use {@link AfricaniesSdkConfig.httpToasts} when set (mutations only;
   *   GET stays silent unless you opt in here).
   * - `false` — never toast this call (overrides config). Prefer only for rare
   *   cases that fully own error UI; mutations should usually toast.
   * - Partial flags — merge with config defaults (same shape as {@link withToast}).
   */
  toast?: Partial<ToastHttpOptions> | false;

  /**
   * Override `x-shipment-mode` for this request only.
   *
   * Does not call {@link ShippingModeService.setMode} — the tab / session mode
   * stays unchanged. {@link getResource} also uses this for the `mode` query
   * param when provided.
   */
  shippingMode?: ShippingMode;
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
 * - {@link normalize} on every **2xx** body
 * - HTTP failures rethrown as `Error` whose `.message` is already
 *   user-facing ({@link formatApiErrorMessage}) — consumers do not need to
 *   parse `HttpErrorResponse` bodies
 * - **No automatic retry** — fail fast so UIs can show Select / table /
 *   error-state Retry instead of a stuck loading spinner
 * - Optional per-GET TTL cache via `cacheTtlMs`
 *
 * @example
 * ```ts
 * const api = inject(ApiClient);
 * api.get<User>('/users/1').subscribe({
 *   next: (res) => {
 *     if (res.success) console.log(res.data);
 *     else console.error(res.message); // already joined when a validation bag exists
 *   },
 *   error: (err: Error) => console.error(err.message),
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AFRICANIES_SDK_CONFIG);
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
   * PUT with wrapped envelope (default).
   *
   * @typeParam T - Payload type inside `data`.
   * @typeParam TBody - JSON body type.
   */
  put<T, TBody = unknown>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * PUT returning bare payload `T`.
   *
   * @typeParam T - Unwrapped payload type.
   * @typeParam TBody - JSON body type.
   */
  put<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  put<T, TBody = unknown>(
    path: string,
    body: TBody,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * DELETE with wrapped envelope (default).
   *
   * @typeParam T - Payload type inside `data`.
   * @typeParam TBody - Optional JSON body (Laravel deletes that expect `{ id }`).
   */
  delete<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: ApiRequestOptions & { responseMode?: 'wrapped' },
  ): Observable<ApiResponseModel<T>>;

  /**
   * DELETE returning bare payload `T`.
   *
   * @typeParam T - Unwrapped payload type.
   * @typeParam TBody - Optional JSON body.
   */
  delete<T, TBody = unknown>(
    path: string,
    body: TBody | undefined,
    options: ApiRequestOptions & { responseMode: 'raw' },
  ): Observable<T>;

  delete<T, TBody = unknown>(
    path: string,
    body?: TBody,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T> | T> {
    return this.request<T>('DELETE', path, body, options);
  }

  /**
   * List/detail GET using the AFRICANIES {@link ResourceId} convention.
   *
   * Prefer the named helpers when exploring the API in the IDE:
   * - {@link getResourcePage} — `id: null` (paginated)
   * - {@link getResourceAll} — `id: 'all'`
   * - {@link getResourceById} — numeric id
   *
   * Always attaches `mode` from the active tab or {@link ApiRequestOptions.shippingMode}
   * (in addition to the `x-shipment-mode` header from {@link shipmentModeInterceptor}).
   *
   * @typeParam T - Element type for lists, or record type for by-id.
   *
   * @example
   * ```ts
   * api.getResource<Shipment>('shipments', null, { page: 1, size: 15 })
   *   .subscribe((res) => console.log(res.data, res.pagination));
   * ```
   */
  getResource<T>(
    basePath: string,
    id: null,
    query?: PaginationQueryParamsModel,
    options?: ApiRequestOptions,
  ): Observable<ApiResponseModel<T[]>>;

  /**
   * Full unpaginated list: `GET {basePath}/all` (pagination query ignored).
   *
   * @typeParam T - Element type of the list.
   */
  getResource<T>(
    basePath: string,
    id: 'all',
    query?: PaginationQueryParamsModel,
    options?: ApiRequestOptions,
  ): Observable<ApiResponseModel<T[]>>;

  /**
   * Single record: `GET {basePath}/{id}` (pagination query ignored).
   *
   * @typeParam T - Record type.
   */
  getResource<T>(
    basePath: string,
    id: number,
    query?: PaginationQueryParamsModel,
    options?: ApiRequestOptions,
  ): Observable<ApiResponseModel<T>>;

  getResource<T>(
    basePath: string,
    id: ResourceId,
    query?: PaginationQueryParamsModel,
    options: ApiRequestOptions = {},
  ): Observable<ApiResponseModel<T | T[]>> {
    const path = buildResourcePath(basePath, id);

    const params: Record<string, string | number | boolean | null | undefined> =
      {
        mode: resolveRequestShippingMode(options, this.shippingMode.mode()),
        ...(options.params ?? {}),
      };

    // Pagination applies only to the paginated-list shape (id === null).
    // Size always ships — SDK default is 15 unless the caller overrides.
    if (id === null) {
      if (query?.page !== undefined) {
        params['page'] = query.page;
      }
      params['size'] = query?.size ?? DEFAULT_PAGE_SIZE;
      if (query?.order !== undefined) {
        params['order'] = query.order;
      }
    }

    const { responseMode: _ignored, ...requestOptions } = options;
    return this.get<T | T[]>(path, { ...requestOptions, params });
  }

  /**
   * Paginated list — {@link ResourceId} `null`.
   * IDE-friendly alias for `getResource(basePath, null, query)`.
   *
   * Page size defaults to {@link DEFAULT_PAGE_SIZE} (`15`) unless
   * `query.size` is set. Bind `res.pagination` to `africanies-pagination`.
   *
   * @typeParam T - Element type of the list.
   * @param basePath - Resource base path (no trailing id segment).
   * @param query - Optional page/size/order.
   */
  getResourcePage<T>(
    basePath: string,
    query?: PaginationQueryParamsModel,
  ): Observable<ApiResponseModel<T[]>> {
    return this.getResource<T>(basePath, null, query);
  }

  /**
   * Full unpaginated dump — {@link ResourceId} `'all'`.
   * IDE-friendly alias for `getResource(basePath, 'all')`.
   *
   * @typeParam T - Element type of the list.
   * @param basePath - Resource base path.
   */
  getResourceAll<T>(basePath: string): Observable<ApiResponseModel<T[]>> {
    return this.getResource<T>(basePath, 'all');
  }

  /**
   * Single record — {@link ResourceId} number.
   * IDE-friendly alias for `getResource(basePath, id)`.
   *
   * @typeParam T - Record type.
   * @param basePath - Resource base path.
   * @param id - Numeric primary key.
   */
  getResourceById<T>(
    basePath: string,
    id: number,
  ): Observable<ApiResponseModel<T>> {
    return this.getResource<T>(basePath, id);
  }

  /**
   * Clears the in-memory GET cache (e.g. on logout).
   */
  clearCache(): void {
    this.cache.clear();
  }

  private buildHttpContext(
    options: ApiRequestOptions,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  ): HttpContext | undefined {
    return resolveApiRequestContext(this.config.httpToasts, options, method);
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body: unknown,
    options: ApiRequestOptions,
  ): Observable<ApiResponseModel<T> | T> {
    const responseMode: ResponseMode = options.responseMode ?? 'wrapped';
    const url = this.resolveUrl(path);
    const hasBody =
      method === 'POST' ||
      method === 'PUT' ||
      method === 'PATCH' ||
      (method === 'DELETE' && body !== undefined && body !== null);
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    // FormData must not send application/json — the browser sets multipart + boundary.
    let headers = this.buildHeaders(options.headers, hasBody && !isFormData);
    if (isFormData && headers.has('Content-Type')) {
      headers = headers.delete('Content-Type');
    }
    const params = this.buildParams(options.params);
    const context = this.buildHttpContext(options, method);
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
    const httpOpts = context ? { headers, params, context } : { headers, params };
    switch (method) {
      case 'GET':
        req$ = this.http.get(url, httpOpts);
        break;
      case 'POST':
        req$ = this.http.post(url, body, httpOpts);
        break;
      case 'PUT':
        req$ = this.http.put(url, body, httpOpts);
        break;
      case 'PATCH':
        req$ = this.http.patch(url, body, httpOpts);
        break;
      case 'DELETE':
        req$ = this.http.delete(
          url,
          hasBody ? { ...httpOpts, body } : httpOpts,
        );
        break;
    }

    // No automatic GET retry — admin shells own Retry via UI
    // (`africanies-select` showRetry, table error→refreshClick, error-state).

    if (this.config.timeout != null) {
      req$ = req$.pipe(
        timeout({
          each: this.config.timeout,
          with: () =>
            throwError(
              () =>
                new Error(
                  `AFRICANIES API request timed out after ${this.config.timeout}ms: ${method} ${url}`,
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
      catchError((err: unknown) =>
        throwError(() => new Error(formatApiErrorMessage(err))),
      ),
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
      if (value === null || value === undefined || value === '') {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}
