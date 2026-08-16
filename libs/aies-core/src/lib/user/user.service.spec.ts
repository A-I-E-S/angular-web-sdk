import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@aies/aies-models';

import { ApiClient } from '../http/api-client';
import {
  USER_CHANGE_PASSWORD_PATH,
  USER_LOGOUT_FROM_ALL_SESSIONS_PATH,
  USER_PATH,
} from './user.mapper';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let getMock: jest.Mock;
  let postMock: jest.Mock;

  /** Simulates ApiClient after normalize() wraps a bare user object. */
  const wireEnvelope: ApiResponseModel<unknown> = {
    success: true,
    message: null,
    data: {
      id: 48,
      central_id: '50fb183b-af87-4e4d-9384-c960d8a1b852',
      name: 'Oladotun Adedeji',
      first_name: 'Oladotun',
      last_name: 'Adedeji',
      email: 'oladotun.a@africanies.com',
      country: null,
      state: null,
      accounts: [],
      socialite_signup: 0,
      form_signup: 1,
    },
    errors: null,
    pagination: null,
    status_code: null,
  };

  beforeEach(() => {
    getMock = jest.fn().mockReturnValue(of(wireEnvelope));
    postMock = jest.fn().mockReturnValue(
      of({
        success: true,
        message: 'Password updated',
        data: [],
        errors: null,
        pagination: null,
        status_code: 200,
      } satisfies ApiResponseModel<unknown>),
    );

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiClient, useValue: { get: getMock, post: postMock } },
      ],
    });

    service = TestBed.inject(UserService);
  });

  it('GETs /user without cache and maps the bare payload', (done) => {
    service.me().subscribe((res) => {
      expect(getMock).toHaveBeenCalledWith(USER_PATH);
      expect(res.data?.email).toBe('oladotun.a@africanies.com');
      expect(res.data?.central_id).toBe('50fb183b-af87-4e4d-9384-c960d8a1b852');
      expect(res.data?.form_signup).toBe(1);
      expect(res.data?.socialite_signup).toBe(0);
      done();
    });
  });

  it('POSTs /user/change/password with current and new passwords', (done) => {
    const body = {
      current_password: 'Default123!',
      password: 'NewPass123!',
      password_confirmation: 'NewPass123!',
    };
    service.changePassword(body).subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(USER_CHANGE_PASSWORD_PATH, body);
      expect(res.success).toBe(true);
      done();
    });
  });

  it('POSTs /user/logout-from-all-sessions with an empty body', (done) => {
    service.logoutFromAllSessions().subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(
        USER_LOGOUT_FROM_ALL_SESSIONS_PATH,
        {},
      );
      expect(res.success).toBe(true);
      done();
    });
  });
});
