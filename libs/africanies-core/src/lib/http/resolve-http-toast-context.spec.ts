import { resolveHttpToastContext } from './resolve-http-toast-context';
import { TOAST_HTTP_OPTIONS } from './toast-http.context';

describe('resolveHttpToastContext', () => {
  it('returns undefined when config and request are off', () => {
    expect(resolveHttpToastContext('off', undefined, 'POST')).toBeUndefined();
    expect(resolveHttpToastContext(undefined, undefined, 'POST')).toBeUndefined();
  });

  it('keeps GET silent under errors and all unless opted in', () => {
    expect(resolveHttpToastContext('errors', undefined, 'GET')).toBeUndefined();
    expect(resolveHttpToastContext('all', undefined, 'GET')).toBeUndefined();
  });

  it('allows GET to opt into error toasts explicitly', () => {
    const ctx = resolveHttpToastContext('errors', { error: true, success: false }, 'GET');
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: false,
      error: true,
      successMessage: undefined,
      errorMessage: undefined,
    });
  });

  it('tags errors-only from config mode for mutations', () => {
    const ctx = resolveHttpToastContext('errors', undefined, 'POST');
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: false,
      error: true,
      successMessage: undefined,
      errorMessage: undefined,
    });
  });

  it('tags success and error from config mode all for mutations', () => {
    const ctx = resolveHttpToastContext('all', undefined, 'PUT');
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: true,
      error: true,
      successMessage: undefined,
      errorMessage: undefined,
    });
  });

  it('merges per-request overrides onto config defaults', () => {
    const ctx = resolveHttpToastContext(
      'errors',
      { errorMessage: 'Warehouse list failed' },
      'PATCH',
    );
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: false,
      error: true,
      successMessage: undefined,
      errorMessage: 'Warehouse list failed',
    });
  });

  it('allows per-request opt-in when config is off', () => {
    const ctx = resolveHttpToastContext(
      'off',
      { success: false, error: true },
      'POST',
    );
    expect(ctx?.get(TOAST_HTTP_OPTIONS)?.error).toBe(true);
    expect(ctx?.get(TOAST_HTTP_OPTIONS)?.success).toBe(false);
  });

  it('per-request false suppresses config defaults', () => {
    expect(resolveHttpToastContext('errors', false, 'POST')).toBeUndefined();
  });
});
