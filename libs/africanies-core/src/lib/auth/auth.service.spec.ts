import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import type { ApiResponseModel } from '@africanies/africanies-models';

import { ApiClient } from '../http/api-client';
import { AUTH_FORGOT_PASSWORD_PATH } from './auth.paths';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let postMock: jest.Mock;

  const wireEnvelope: ApiResponseModel<unknown[]> = {
    success: true,
    message: 'We have emailed your reset password ',
    data: [],
    errors: null,
    pagination: null,
    status_code: 200,
  };

  beforeEach(() => {
    postMock = jest.fn().mockReturnValue(of(wireEnvelope));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiClient, useValue: { post: postMock } },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('POSTs /auth/forgot/password with a trimmed email', (done) => {
    service.forgot('  bussybase@yahoo.com  ').subscribe((res) => {
      expect(postMock).toHaveBeenCalledWith(AUTH_FORGOT_PASSWORD_PATH, {
        email: 'bussybase@yahoo.com',
      });
      expect(res.success).toBe(true);
      expect(res.message).toContain('emailed your reset password');
      expect(res.data).toEqual([]);
      done();
    });
  });
});
