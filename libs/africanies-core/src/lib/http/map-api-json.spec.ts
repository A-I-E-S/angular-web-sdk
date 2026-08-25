import type { ApiJsonValue } from '@africanies/africanies-models';

import { mapApiJsonList, mapApiJsonValue } from './map-api-json';

describe('mapApiJsonValue', () => {
  it('coerces nullish and unsupported values to null', () => {
    expect(mapApiJsonValue(null)).toBeNull();
    expect(mapApiJsonValue(undefined)).toBeNull();
    expect(mapApiJsonValue(Number.NaN)).toBeNull();
  });

  it('preserves primitives and deep-maps objects without undefined', () => {
    const mapped = mapApiJsonValue({
      a: 1,
      b: 'x',
      c: undefined,
      d: { e: null, f: [true, undefined] },
    }) as Record<string, ApiJsonValue>;

    expect(mapped['a']).toBe(1);
    expect(mapped['b']).toBe('x');
    expect(mapped['c']).toBeNull();
    expect(mapped['d']).toEqual({ e: null, f: [true, null] });
  });

  it('mapApiJsonList returns [] for non-arrays', () => {
    expect(mapApiJsonList(null)).toEqual([]);
    expect(mapApiJsonList({ a: 1 })).toEqual([]);
    expect(mapApiJsonList([1, undefined])).toEqual([1, null]);
  });
});
