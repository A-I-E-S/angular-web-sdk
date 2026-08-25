import {
  COUNTRY_READ_PATH,
  mapCountry,
  mapCountryList,
  mapCountryState,
} from './country.mapper';

/** Abbreviated wire sample from GET /public/country/read/all. */
const WIRE_AFGHANISTAN = {
  id: 1,
  name: 'Afghanistan',
  iso3: 'AFG',
  iso2: 'AF',
  states: [
    { name: 'Badakhshan', state_code: 'BDS' },
    { name: 'Kabul', state_code: 'KAB' },
  ],
};

describe('country.mapper', () => {
  it('exposes the public country read path', () => {
    expect(COUNTRY_READ_PATH).toBe('/public/country/read');
  });

  it('maps snake_case state_code to stateCode', () => {
    expect(mapCountryState({ name: 'Lagos', state_code: 'LA' })).toEqual({
      name: 'Lagos',
      state_code: 'LA',
    });
  });

  it('accepts already-camelCased state payloads', () => {
    expect(mapCountryState({ name: 'Lagos', state_code: 'LA' })).toEqual({
      name: 'Lagos',
      state_code: 'LA',
    });
  });

  it('maps a wire country into CountryModel', () => {
    expect(mapCountry(WIRE_AFGHANISTAN)).toEqual({
      id: 1,
      name: 'Afghanistan',
      iso3: 'AFG',
      iso2: 'AF',
      states: [
        { name: 'Badakhshan', state_code: 'BDS' },
        { name: 'Kabul', state_code: 'KAB' },
      ],
    });
  });

  it('maps an array payload via mapCountryList', () => {
    const list = mapCountryList([WIRE_AFGHANISTAN]);
    expect(list).toHaveLength(1);
    expect(list[0]?.iso2).toBe('AF');
    expect(list[0]?.states[0]?.state_code).toBe('BDS');
  });

  it('wraps a single object payload as a one-element list', () => {
    const list = mapCountryList(WIRE_AFGHANISTAN);
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('Afghanistan');
  });

  it('returns an empty list for nullish payloads', () => {
    expect(mapCountryList(null)).toEqual([]);
    expect(mapCountryList(undefined)).toEqual([]);
  });
});
