import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import {
  NOTIFICATION_PAGE_SIZE,
  type ApiResponseModel,
  type NotificationModel,
  type ResourceId,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  type ResourceQueryParams,
} from '../http/resource-path';
import {
  mapNotification,
  mapNotificationList,
  NOTIFICATION_READ_PATH,
  NOTIFICATION_UPDATE_PATH,
} from './notification.mapper';

/** Query bag for notification reads (pagination applies only when `id` is `null`). */
export type NotificationReadParams = ResourceQueryParams;

/**
 * Authenticated user notifications (`GET /user/notifications/read/{id?}`).
 *
 * Uses the AIES {@link ResourceId} convention for paginated / full-list reads.
 * Notification primary keys are UUID strings — use {@link readOne} for a single row.
 *
 * Requires an access token via {@link AuthTokenService.set}. Not cached — inbox
 * data is auth-sensitive and changes frequently.
 *
 * @example
 * ```ts
 * const notifications = inject(NotificationService);
 *
 * notifications.readAll().subscribe((res) => {
 *   console.log(res.data?.length);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiClient);

  /** Paginated inbox page — {@link ResourceId} `null`. */
  read(
    id?: null,
    params?: NotificationReadParams,
  ): Observable<ApiResponseModel<NotificationModel[]>>;

  /** Full inbox list — {@link ResourceId} `'all'`. */
  read(
    id: 'all',
    params?: NotificationReadParams,
  ): Observable<ApiResponseModel<NotificationModel[]>>;

  read(
    id: ResourceId = null,
    params?: NotificationReadParams,
  ): Observable<ApiResponseModel<NotificationModel[]>> {
    const query: NotificationReadParams | undefined =
      id === null
        ? { ...params, size: params?.size ?? NOTIFICATION_PAGE_SIZE }
        : params;

    return this.api
      .get<unknown>(buildResourcePath(NOTIFICATION_READ_PATH, id), {
        params: buildResourceQueryParams(id, query),
      })
      .pipe(
        map((res) => ({
          ...res,
          data: mapResourcePayload(
            id,
            res.data,
            mapNotification,
            mapNotificationList,
          ) as NotificationModel[] | null,
        })),
      );
  }

  /**
   * Paginated page — alias for {@link read}(`null`, params).
   * Size defaults to {@link NOTIFICATION_PAGE_SIZE} (`30`).
   * @param params
   */
  readPage(
    params?: NotificationReadParams,
  ): Observable<ApiResponseModel<NotificationModel[]>> {
    return this.read(null, params);
  }

  /**
   * Full list — alias for {@link read}(`'all'`).
   * @param params
   */
  readAll(
    params?: NotificationReadParams,
  ): Observable<ApiResponseModel<NotificationModel[]>> {
    return this.read('all', params);
  }

  /**
   * Single notification by UUID (`GET /user/notifications/read/{uuid}`).
   * @param id
   */
  readOne(id: string): Observable<ApiResponseModel<NotificationModel>> {
    const trimmed = id.trim();
    return this.api
      .get<unknown>(`${NOTIFICATION_READ_PATH}/${encodeURIComponent(trimmed)}`)
      .pipe(
        map((res) => ({
          ...res,
          data:
            res.data == null
              ? null
              : mapNotification(
                  Array.isArray(res.data) ? res.data[0] : res.data,
                ),
        })),
      );
  }

  /**
   * Mark one or all notifications read (`PUT /user/notifications/update`).
   *
   * @param id - When set, marks that notification read; omit to mark all read.
   */
  markRead(id?: string): Observable<ApiResponseModel<unknown>> {
    const body = id ? { id } : {};
    return this.api.put<unknown, { id?: string }>(NOTIFICATION_UPDATE_PATH, body);
  }
}
