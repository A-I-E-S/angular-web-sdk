import {
  buildPhoneNumberValue,
  filterPhoneCountries,
  matchDialCode,
  parsePhoneControlValue,
  phoneCountryOptions,
  phoneDigitsOnly,
  phoneToE164,
  removeDialCode,
} from './phone-input.utils';

describe('phone-input.utils', () => {
  it('builds an E.164 structured value for Nigeria', () => {
    const phone = buildPhoneNumberValue('NG', '8012345678');
    expect(phone).toEqual({
      number: '801 234 5678',
      internationalNumber: '+234 801 234 5678',
      nationalNumber: '0801 234 5678',
      e164Number: '+2348012345678',
      countryCode: 'NG',
      dialCode: '+234',
    });
  });

  it('matches dial codes preferring the hint for shared +1', () => {
    const matched = matchDialCode('+18015551234', 'US');
    expect(matched?.iso2).toBe('US');
    expect(matched?.nationalDigits).toBe('8015551234');
  });

  it('strips dial code for prefills', () => {
    expect(removeDialCode('+2348012345678', 'NG')).toBe('8012345678');
  });

  it('parses E.164 control values for edit prepopulate', () => {
    expect(parsePhoneControlValue('+2348012345678', 'US')).toEqual({
      iso2: 'NG',
      nationalDigits: '8012345678',
    });
  });

  it('keeps national digits when the value has no dial code', () => {
    expect(parsePhoneControlValue('08012345678', 'NG')).toEqual({
      iso2: 'NG',
      nationalDigits: '08012345678',
    });
  });

  it('normalizes structured or string phones to E.164', () => {
    expect(phoneToE164('+234 801 234 5678')).toBe('+2348012345678');
    expect(
      phoneToE164({
        number: '801 234 5678',
        internationalNumber: '+234 801 234 5678',
        nationalNumber: '0801 234 5678',
        e164Number: '+2348012345678',
        countryCode: 'NG',
        dialCode: '+234',
      }),
    ).toBe('+2348012345678');
  });

  it('filters countries by name without matching every dial code', () => {
    const countries = phoneCountryOptions();
    const nigeria = filterPhoneCountries(countries, 'nigeria');
    expect(nigeria.some((row) => row.iso2 === 'NG')).toBe(true);
    expect(nigeria.length).toBeLessThan(countries.length);
    expect(
      nigeria.every((row) => row.name.toLowerCase().includes('nigeria')),
    ).toBe(true);
  });

  it('filters countries by dial digits', () => {
    const countries = phoneCountryOptions();
    const matched = filterPhoneCountries(countries, '234');
    expect(matched.some((row) => row.iso2 === 'NG')).toBe(true);
    expect(
      matched.every((row) => phoneDigitsOnly(row.dialCode).includes('234')),
    ).toBe(true);
  });
});
