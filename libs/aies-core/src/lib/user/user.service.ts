import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type { ApiResponseModel, UserModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import { mapUser, USER_PATH } from './user.mapper';

/**
 * Current authenticated user (`GET /user`).
 *
 * The backend returns a **bare** user object (no `{ success, data }` wrapper).
 * {@link ApiClient} normalizes that into {@link ApiResponseModel}; this service
 * maps wire fields once into {@link UserModel} (snake_case preserved).
 *
 * Requires an auth token via {@link AUTH_TOKEN_PROVIDER}. Not cached — profile
 * data is auth-sensitive and can change per session.
 *
 * @example
 * ```ts
 * const users = inject(UserService);
 *
 * users.me().subscribe((res) => {
 *   if (res.success) console.log(res.data?.email);
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiClient);

  /**
   * Fetch the current user.
   *
   * @returns Normalized envelope with mapped {@link UserModel} (or `null` data).
   */
  me(): Observable<ApiResponseModel<UserModel>> {
    return this.api.get<unknown>(USER_PATH).pipe(
      map((res) => ({
        ...res,
        data: res.data == null ? null : mapUser(res.data),
      })),
    );
  }
}
