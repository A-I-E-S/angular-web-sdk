import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ChangePasswordRequestModel,
  UserModel,
} from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  mapUser,
  USER_CHANGE_PASSWORD_PATH,
  USER_LOGOUT_FROM_ALL_SESSIONS_PATH,
  USER_PATH,
} from './user.mapper';

/**
 * Current authenticated user (`GET /user`).
 *
 * The backend returns a **bare** user object (no `{ success, data }` wrapper).
 * {@link ApiClient} normalizes that into {@link ApiResponseModel}; this service
 * maps wire fields once into {@link UserModel} (snake_case preserved).
 *
 * Requires an access token via {@link AuthTokenService.set}. Not cached — profile
 * data is auth-sensitive and can change per session.
 *
 * After login, if `user.default_password` is set, send the user to
 * `/onboarding/reset-password` and call {@link changePassword} (current → new).
 * That page is **not** the email-link forgot-password flow.
 *
 * On logout, call {@link logoutFromAllSessions} while the bearer token is still
 * set, then {@link AuthTokenService.clear}.
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

  /**
   * Change the signed-in user’s password (`POST /user/change/password`).
   *
   * Used on first login when {@link UserModel.default_password} is true —
   * not the email-only {@link AuthService.forgot} flow.
   *
   * @param body - Current password plus new password and confirmation.
   * @returns Normalized envelope (`data` is typically unused).
   */
  changePassword(
    body: ChangePasswordRequestModel,
  ): Observable<ApiResponseModel<unknown>> {
    return this.api.post<unknown, ChangePasswordRequestModel>(
      USER_CHANGE_PASSWORD_PATH,
      {
        current_password: body.current_password,
        password: body.password,
        password_confirmation: body.password_confirmation,
      },
    );
  }

  /**
   * Sign out of this device and every other session
   * (`POST /user/logout-from-all-sessions`).
   *
   * Call while the bearer token is still set so the interceptor can attach
   * `Authorization`. Then {@link AuthTokenService.clear} locally.
   *
   * @returns Normalized envelope (`data` is typically unused).
   */
  logoutFromAllSessions(): Observable<ApiResponseModel<unknown>> {
    return this.api.post<unknown, Record<string, never>>(
      USER_LOGOUT_FROM_ALL_SESSIONS_PATH,
      {},
    );
  }
}
