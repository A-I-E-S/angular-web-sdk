import { normalizeCarrierLogoSlug } from './carrier-logo.component';

describe('normalizeCarrierLogoSlug', () => {
  it.each([
    ['fedex', 'fedex'],
    ['FEDEX', 'fedex'],
    ['dhl', 'dhl'],
    ['amazon', 'amazon'],
    ['usps', 'usps'],
    ['ups', 'ups'],
    ['FedEx Ground', 'fedex'],
    ['DHL Express', 'dhl'],
  ] as const)('maps %s → %s', (input, expected) => {
    expect(normalizeCarrierLogoSlug(input)).toBe(expected);
  });

  it('returns null for others and unknown carriers', () => {
    expect(normalizeCarrierLogoSlug('others')).toBeNull();
    expect(normalizeCarrierLogoSlug('')).toBeNull();
    expect(normalizeCarrierLogoSlug('walk-in')).toBeNull();
    expect(normalizeCarrierLogoSlug(null)).toBeNull();
  });
});
