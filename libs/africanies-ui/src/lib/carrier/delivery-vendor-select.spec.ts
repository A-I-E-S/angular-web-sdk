import {
  deliveryVendorOptionsForStoredValue,
  deliveryVendorSelectOptions,
} from './delivery-vendor-select';

describe('delivery-vendor-select', () => {
  it('injects an Others option when the stored value is unknown', () => {
    const options = deliveryVendorOptionsForStoredValue(
      'legacy-carrier',
      deliveryVendorSelectOptions(),
    );
    expect(options[0]).toEqual({ label: 'Others', value: 'legacy-carrier' });
    expect(options.some((row) => row.value === 'fedex')).toBe(true);
  });

  it('includes walk-in only for export vendor options', () => {
    expect(
      deliveryVendorSelectOptions(true).some((row) => row.value === 'walk-in'),
    ).toBe(true);
    expect(
      deliveryVendorSelectOptions(false).some((row) => row.value === 'walk-in'),
    ).toBe(false);
  });
});
