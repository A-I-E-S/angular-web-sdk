import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import type {
  ApiResponseModel,
  ForgotPasswordRequestModel,
} from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { asString } from '../http/wire';
import { AUTH_FORGOT_PASSWORD_PATH } from './auth.paths';

/**
 * Unauthenticated auth endpoints (`POST /auth/…`).
 *
 * **Forgot password is email-only.** `forgot()` POSTs `{ email }`; the
 * backend emails a reset link. This product UI never collects a new password
 * for that link (no token in the route, `/onboarding/reset-password` is
 * **not** that flow).
 *
 * `/onboarding/reset-password` is first login with a default password: after
 * login, if `user.default_password` is set, the host sends the user there to
 * change current → new via {@link UserService.changePassword}.
 *
 * Token persistence stays on {@link AuthTokenService}. These calls do not
 * require a bearer token — the interceptor omits `Authorization` when none
 * is stored. Admin user/partner screens reuse {@link forgot} with that
 * user’s email.
 *
 * @example
 * ```ts
 * const authApi = inject(AuthService);
 *
 * authApi.forgot('user@example.com').subscribe((res) => {
 *   if (res.success) {
 *     // Show res.message, then “Reset completed? Login here”.
 *   }
 * });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);

  /**
   * Request a password-reset email (`POST /auth/forgot/password`).
   *
   * Enable submit only when the address looks valid. Wire `data` is an empty
   * array on success — use {@link ApiResponseModel.message} for the banner.
   *
   * @param email - Registered account email.
   * @returns Normalized envelope (`data` is typically `[]`).
   */
  forgot(email: string): Observable<ApiResponseModel<unknown[]>> {
    return this.api.post<unknown[], ForgotPasswordRequestModel>(
      AUTH_FORGOT_PASSWORD_PATH,
      { email: asString(email).trim() },
    );
  }
}
