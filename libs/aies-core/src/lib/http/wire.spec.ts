import {
  asArray,
  asBoolean,
  asNullableBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
  toFlag01,
} from './wire';

describe('wire coercions', () => {
  it('asRecord rejects arrays and scalars', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toBeNull();
    expect(asRecord([1])).toBeNull();
    expect(asRecord('x')).toBeNull();
  });

  it('asArray / mapArray never throw on missing lists', () => {
    expect(asArray(undefined)).toEqual([]);
    expect(asArray(null)).toEqual([]);
    expect(asArray('nope')).toEqual([]);
    expect(mapArray(undefined, (entry) => entry)).toEqual([]);
    expect(mapArray([1, 2], (entry) => Number(entry) * 2)).toEqual([2, 4]);
  });

  it('mapList accepts array, single object, or empty', () => {
    const mapOne = (raw: unknown) => asNumber(asRecord(raw)?.['id']);
    expect(mapList(undefined, mapOne)).toEqual([]);
    expect(mapList(null, mapOne)).toEqual([]);
    expect(mapList([{ id: 3 }, { id: 4 }], mapOne)).toEqual([3, 4]);
    expect(mapList({ id: 9 }, mapOne)).toEqual([9]);
  });

  it('numbers and strings default instead of throwing', () => {
    expect(asNumber(undefined)).toBe(0);
    expect(asNumber('12')).toBe(12);
    expect(asNullableNumber('')).toBeNull();
    expect(asString(undefined)).toBe('');
    expect(asString(null)).toBe('');
    expect(asNullableString(undefined)).toBeNull();
  });

  it('flags accept boolean, 1/0, and "1"/"0"', () => {
    expect(asBoolean('1')).toBe(true);
    expect(asBoolean('0')).toBe(false);
    expect(asBoolean(undefined)).toBe(false);
    expect(asNullableBoolean(undefined)).toBeNull();
    expect(toFlag01(true)).toBe('1');
    expect(toFlag01(undefined)).toBe('0');
  });
});
