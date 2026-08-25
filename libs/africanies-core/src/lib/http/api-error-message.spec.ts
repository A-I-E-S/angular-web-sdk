import { HttpErrorResponse } from '@angular/common/http';

import { formatApiErrorMessage } from './api-error-message';

describe('formatApiErrorMessage', () => {
  it('joins validation bag messages from a raw envelope', () => {
    expect(
      formatApiErrorMessage({
        success: false,
        status_code: 424,
        message: 'The name field is required.',
        data: {
          name: ['The name field is required.'],
          value: ['The value field is required.'],
        },
      }),
    ).toBe(
      'The name field is required.\nThe value field is required.',
    );
  });

  it('reads HttpErrorResponse bodies', () => {
    expect(
      formatApiErrorMessage(
        new HttpErrorResponse({
          status: 422,
          error: {
            success: false,
            message: 'The name field is required.',
            data: {
              name: ['The name field is required.'],
              value: ['The value field is required.'],
            },
          },
        }),
      ),
    ).toBe(
      'The name field is required.\nThe value field is required.',
    );
  });
});
