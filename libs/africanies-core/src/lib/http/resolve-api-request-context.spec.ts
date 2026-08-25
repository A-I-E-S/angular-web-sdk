import { SHIPPING_MODE_OVERRIDE } from '../shipping/shipping-mode.context';
import type { ApiRequestOptions } from './api-client';
import {
  resolveApiRequestContext,
  resolveRequestShippingMode,
} from './resolve-api-request-context';
import { TOAST_HTTP_OPTIONS } from './toast-http.context';

describe('resolveApiRequestContext', () => {
  it('returns undefined when no toast or shipping override', () => {
    expect(resolveApiRequestContext(undefined, {})).toBeUndefined();
    expect(resolveApiRequestContext('off', {})).toBeUndefined();
  });

  it('tags shipping mode override without enabling toasts', () => {
    const context = resolveApiRequestContext(undefined, {
      shippingMode: 'stn',
    });
    expect(context?.get(SHIPPING_MODE_OVERRIDE)).toBe('stn');
    expect(context?.get(TOAST_HTTP_OPTIONS)).toBeNull();
  });

  it('merges toast and shipping mode context', () => {
    const context = resolveApiRequestContext(
      'all',
      {
        shippingMode: 'stn',
        toast: { successMessage: 'Done' },
      },
      'POST',
    );
    expect(context?.get(SHIPPING_MODE_OVERRIDE)).toBe('stn');
    expect(context?.get(TOAST_HTTP_OPTIONS)).toEqual(
      expect.objectContaining({ success: true, error: true, successMessage: 'Done' }),
    );
  });

  it('keeps GET silent under errors config', () => {
    expect(resolveApiRequestContext('errors', {}, 'GET')).toBeUndefined();
  });
});

describe('resolveRequestShippingMode', () => {
  it('prefers per-request override', () => {
    const options: ApiRequestOptions = { shippingMode: 'stn' };
    expect(resolveRequestShippingMode(options, 'sfn')).toBe('stn');
  });

  it('falls back to the active tab mode', () => {
    expect(resolveRequestShippingMode(undefined, 'sfn')).toBe('sfn');
    expect(resolveRequestShippingMode({}, 'stn')).toBe('stn');
  });
});
