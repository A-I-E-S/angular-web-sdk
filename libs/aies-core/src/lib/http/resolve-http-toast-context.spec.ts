import { TOAST_HTTP_OPTIONS } from './toast-http.context';
import { resolveHttpToastContext } from './resolve-http-toast-context';

describe('resolveHttpToastContext', () => {
  it('returns undefined when config and request are off', () => {
    expect(resolveHttpToastContext('off', undefined)).toBeUndefined();
    expect(resolveHttpToastContext(undefined, undefined)).toBeUndefined();
  });

  it('tags errors-only from config mode', () => {
    const ctx = resolveHttpToastContext('errors', undefined);
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: false,
      error: true,
      successMessage: undefined,
      errorMessage: undefined,
    });
  });

  it('tags success and error from config mode all', () => {
    const ctx = resolveHttpToastContext('all', undefined);
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: true,
      error: true,
      successMessage: undefined,
      errorMessage: undefined,
    });
  });

  it('merges per-request overrides onto config defaults', () => {
    const ctx = resolveHttpToastContext('errors', {
      errorMessage: 'Warehouse list failed',
    });
    expect(ctx?.get(TOAST_HTTP_OPTIONS)).toEqual({
      success: false,
      error: true,
      successMessage: undefined,
      errorMessage: 'Warehouse list failed',
    });
  });

  it('allows per-request opt-in when config is off', () => {
    const ctx = resolveHttpToastContext('off', { success: false, error: true });
    expect(ctx?.get(TOAST_HTTP_OPTIONS)?.error).toBe(true);
    expect(ctx?.get(TOAST_HTTP_OPTIONS)?.success).toBe(false);
  });

  it('per-request false suppresses config defaults', () => {
    expect(resolveHttpToastContext('errors', false)).toBeUndefined();
  });
});
