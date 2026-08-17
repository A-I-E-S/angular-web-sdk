import {
  countryFlagUrl,
  COUNTRY_FLAG_CDN_BASE,
  mapCountrySelectOptions,
} from './country-flag';

describe('countryFlagUrl', () => {
  it('builds a default width PNG URL (lowercase iso2)', () => {
    expect(countryFlagUrl('NG')).toBe(`${COUNTRY_FLAG_CDN_BASE}/w40/ng.png`);
    expect(countryFlagUrl('us')).toBe(`${COUNTRY_FLAG_CDN_BASE}/w40/us.png`);
  });

  it('supports width, height, and format overrides', () => {
    expect(countryFlagUrl('GH', { width: 80, format: 'webp' })).toBe(
      `${COUNTRY_FLAG_CDN_BASE}/w80/gh.webp`,
    );
    expect(countryFlagUrl('KE', { height: 24, format: 'svg' })).toBe(
      `${COUNTRY_FLAG_CDN_BASE}/h24/ke.svg`,
    );
  });

  it('returns empty string for invalid codes', () => {
    expect(countryFlagUrl('')).toBe('');
    expect(countryFlagUrl('NGA')).toBe('');
    expect(countryFlagUrl('N')).toBe('');
  });
});

describe('mapCountrySelectOptions', () => {
  it('maps countries to select rows with flag URLs', () => {
    expect(
      mapCountrySelectOptions([
        { id: 1, name: 'Nigeria', iso2: 'NG', iso3: 'NGA', states: [] },
      ]),
    ).toEqual([
      {
        label: 'Nigeria',
        value: 1,
        iso2: 'NG',
        prefixImageUrl: `${COUNTRY_FLAG_CDN_BASE}/w40/ng.png`,
      },
    ]);
  });

  it('returns [] for empty input', () => {
    expect(mapCountrySelectOptions(null)).toEqual([]);
    expect(mapCountrySelectOptions([])).toEqual([]);
  });
});
