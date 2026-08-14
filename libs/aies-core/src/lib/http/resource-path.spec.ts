import {
  buildResourcePath,
  buildResourceQueryParams,
  mapResourcePayload,
  resourceCacheTtlMs,
  type ResourceQueryParams,
} from './resource-path';

describe('resource-path helpers', () => {
  it('buildResourcePath follows ResourceId convention', () => {
    expect(buildResourcePath('/product/read')).toBe('/product/read');
    expect(buildResourcePath('/product/read', null)).toBe('/product/read');
    expect(buildResourcePath('/product/read/', 'all')).toBe(
      '/product/read/all',
    );
    expect(buildResourcePath('/product/read', 42)).toBe('/product/read/42');
  });

  it('buildResourceQueryParams keeps pagination only for null id', () => {
    expect(
      buildResourceQueryParams(null, {
        page: 2,
        size: 10,
        order: '-name',
        active: true,
      }),
    ).toEqual({ page: 2, size: 10, order: '-name', active: true });

    expect(
      buildResourceQueryParams('all', {
        page: 2,
        size: 10,
        active: true,
      }),
    ).toEqual({ active: true });

    expect(buildResourceQueryParams(1, { page: 1, include: 'states' })).toEqual(
      { include: 'states' },
    );

    expect(buildResourceQueryParams(null)).toEqual({ size: 15 });
    expect(buildResourceQueryParams('all', {})).toBeUndefined();
  });

  it('resourceCacheTtlMs skips paginated lists', () => {
    expect(resourceCacheTtlMs(null, 5_000)).toBeUndefined();
    expect(resourceCacheTtlMs('all', 5_000)).toBe(5_000);
    expect(resourceCacheTtlMs(9, 5_000)).toBe(5_000);
  });

  it('mapResourcePayload maps list vs single shapes', () => {
    const mapOne = (raw: unknown) => ({ id: (raw as { id: number }).id });
    const mapMany = (raw: unknown) =>
      Array.isArray(raw)
        ? raw.map((entry) => mapOne(entry))
        : [mapOne(raw)];

    expect(mapResourcePayload(null, [{ id: 1 }, { id: 2 }], mapOne, mapMany)).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
    expect(mapResourcePayload('all', { id: 3 }, mapOne, mapMany)).toEqual([
      { id: 3 },
    ]);
    expect(mapResourcePayload(3, { id: 3 }, mapOne, mapMany)).toEqual({ id: 3 });
    expect(mapResourcePayload(3, [{ id: 3 }], mapOne, mapMany)).toEqual({
      id: 3,
    });
    expect(mapResourcePayload(3, [], mapOne, mapMany)).toBeNull();
    expect(mapResourcePayload(null, null, mapOne, mapMany)).toBeNull();
  });
});
