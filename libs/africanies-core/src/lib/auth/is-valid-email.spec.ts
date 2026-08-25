import { isValidEmail } from './is-valid-email';

describe('isValidEmail', () => {
  it('accepts a typical address', () => {
    expect(isValidEmail('bussybase@yahoo.com')).toBe(true);
  });

  it('trims surrounding space', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects empty, missing host, or missing tld', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@localhost')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});
