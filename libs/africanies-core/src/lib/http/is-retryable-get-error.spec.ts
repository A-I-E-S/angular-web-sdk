import { HttpErrorResponse } from '@angular/common/http';

import { isRetryableGetError } from './is-retryable-get-error';

describe('isRetryableGetError', () => {
  it('does not retry 401/403 auth failures', () => {
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 401 })),
    ).toBe(false);
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 403 })),
    ).toBe(false);
  });

  it('does not retry other 4xx client errors', () => {
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 404 })),
    ).toBe(false);
  });

  it('retries network and server failures', () => {
    expect(isRetryableGetError(new HttpErrorResponse({ status: 0 }))).toBe(
      true,
    );
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 500 })),
    ).toBe(true);
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 408 })),
    ).toBe(true);
    expect(
      isRetryableGetError(new HttpErrorResponse({ status: 429 })),
    ).toBe(true);
  });

  it('retries non-HTTP errors such as timeouts', () => {
    expect(isRetryableGetError(new Error('timed out'))).toBe(true);
  });
});
