import {
  CURRENCY_CREATE_PATH,
  CURRENCY_DELETE_PATH,
  CURRENCY_READ_PATH,
  CURRENCY_UPDATE_PATH,
  mapCurrency,
  mapCurrencyList,
  mapCurrencyPaymentMethod,
  mapCurrencyPaymentMethodPivot,
  toCurrencyCreateBody,
  toCurrencyDeleteBody,
  toCurrencyFlag01,
  toCurrencyUpdateBody,
} from './currency.mapper';

/** Abbreviated wire sample from GET /currency/read?page=1&order=desc&size=15. */
const WIRE_NAIRA = {
  id: 5,
  name: 'Naira',
  short_code: 'NGN',
  division_rate: '1',
  multiplication_rate: '1',
  is_local_currency_greater: false,
  active: true,
  deleted_at: null,
  created_at: null,
  updated_at: '2024-12-17T15:34:22.000000Z',
  payment_methods: [
    {
      id: 2,
      name: 'Paystack',
      model: 'App\\Models\\Paystack',
      active: true,
      deleted_at: null,
      created_at: '2024-12-17T12:05:50.000000Z',
      updated_at: null,
      pivot: {
        currency_id: 5,
        payment_method_id: 2,
      },
    },
  ],
};

describe('currency.mapper', () => {
  it('exposes currency paths', () => {
    expect(CURRENCY_READ_PATH).toBe('/currency/read');
    expect(CURRENCY_CREATE_PATH).toBe('/currency/create');
    expect(CURRENCY_UPDATE_PATH).toBe('/currency/update');
    expect(CURRENCY_DELETE_PATH).toBe('/currency/delete');
  });

  it('maps a pivot join', () => {
    expect(
      mapCurrencyPaymentMethodPivot({
        currency_id: 5,
        payment_method_id: 2,
      }),
    ).toEqual({
      currency_id: 5,
      payment_method_id: 2,
    });
  });

  it('maps a payment method with pivot', () => {
    const mapped = mapCurrencyPaymentMethod(WIRE_NAIRA.payment_methods[0]);
    expect(mapped.id).toBe(2);
    expect(mapped.name).toBe('Paystack');
    expect(mapped.model).toBe('App\\Models\\Paystack');
    expect(mapped.active).toBe(true);
    expect(mapped.pivot).toEqual({
      currency_id: 5,
      payment_method_id: 2,
    });
  });

  it('maps snake_case currency fields and nested methods', () => {
    const mapped = mapCurrency(WIRE_NAIRA);
    expect(mapped.id).toBe(5);
    expect(mapped.name).toBe('Naira');
    expect(mapped.short_code).toBe('NGN');
    expect(mapped.division_rate).toBe('1');
    expect(mapped.multiplication_rate).toBe('1');
    expect(mapped.is_local_currency_greater).toBe(false);
    expect(mapped.is_naira_greater).toBe(false);
    expect(mapped.active).toBe(true);
    expect(mapped.payment_methods).toHaveLength(1);
    expect(mapped.payment_methods[0]?.name).toBe('Paystack');
  });

  it('treats wire "0" / "1" flags as booleans (not Boolean("0"))', () => {
    const mapped = mapCurrency({
      id: 12,
      name: 'United States Dollar',
      short_code: 'USD',
      multiplication_rate: '1600',
      division_rate: '1400',
      active: '0',
      is_naira_greater: '1',
      payment_methods: [{ id: 1, name: 'Stripe', model: 'App\\Stripe', active: '0' }],
    });
    expect(mapped.active).toBe(false);
    expect(mapped.is_naira_greater).toBe(true);
    expect(mapped.is_local_currency_greater).toBe(true);
    expect(mapped.payment_methods[0]?.active).toBe(false);
  });

  it('mapCurrencyList normalizes arrays and single objects', () => {
    expect(mapCurrencyList([WIRE_NAIRA])).toHaveLength(1);
    expect(mapCurrencyList(WIRE_NAIRA)[0]?.short_code).toBe('NGN');
    expect(mapCurrencyList(null)).toEqual([]);
  });

  it('accepts camelCase aliases', () => {
    const mapped = mapCurrency({
      id: 1,
      name: 'US Dollars',
      shortCode: 'USD',
      divisionRate: '1600',
      multiplicationRate: '1700',
      isLocalCurrencyGreater: false,
      active: true,
      paymentMethods: [
        {
          id: 3,
          name: 'Stripe',
          model: 'App\\Models\\Stripe',
          active: true,
          pivot: { currencyId: 1, paymentMethodId: 3 },
        },
      ],
    });
    expect(mapped.short_code).toBe('USD');
    expect(mapped.division_rate).toBe('1600');
    expect(mapped.multiplication_rate).toBe('1700');
    expect(mapped.is_naira_greater).toBe(false);
    expect(mapped.payment_methods[0]?.pivot).toEqual({
      currency_id: 1,
      payment_method_id: 3,
    });
  });

  it('defaults missing payment_methods to an empty list', () => {
    expect(mapCurrency({ id: 1, name: 'X', short_code: 'XXX' }).payment_methods).toEqual(
      [],
    );
  });

  it('toCurrencyFlag01 serializes booleans and wire flags', () => {
    expect(toCurrencyFlag01(true)).toBe('1');
    expect(toCurrencyFlag01(false)).toBe('0');
    expect(toCurrencyFlag01('1')).toBe('1');
    expect(toCurrencyFlag01('0')).toBe('0');
    expect(toCurrencyFlag01(1)).toBe('1');
    expect(toCurrencyFlag01(0)).toBe('0');
  });

  it('toCurrencyCreateBody sends name/code and "1"/"0" flags', () => {
    expect(
      toCurrencyCreateBody({
        name: ' United States Dollar ',
        short_code: ' USD ',
        multiplication_rate: '1600',
        division_rate: '1400',
        active: true,
        is_naira_greater: false,
        payment_method_ids: [1, 2],
      }),
    ).toEqual({
      name: 'United States Dollar',
      short_code: 'USD',
      multiplication_rate: '1600',
      division_rate: '1400',
      active: '1',
      is_naira_greater: '0',
      payment_method_ids: [1, 2],
    });
  });

  it('toCurrencyUpdateBody omits name/short_code', () => {
    expect(
      toCurrencyUpdateBody({
        id: 12,
        multiplication_rate: '1600',
        division_rate: '1400',
        active: '1',
        is_naira_greater: '0',
        payment_method_ids: [1, 2],
      }),
    ).toEqual({
      id: 12,
      multiplication_rate: '1600',
      division_rate: '1400',
      active: '1',
      is_naira_greater: '0',
      payment_method_ids: [1, 2],
    });
  });

  it('toCurrencyCreateBody does not throw when optional lists are missing', () => {
    expect(
      toCurrencyCreateBody({
        name: 'USD',
        short_code: 'USD',
        multiplication_rate: '1',
        division_rate: '1',
        active: true,
        is_naira_greater: false,
      } as never),
    ).toEqual({
      name: 'USD',
      short_code: 'USD',
      multiplication_rate: '1',
      division_rate: '1',
      active: '1',
      is_naira_greater: '0',
      payment_method_ids: [],
    });
  });

  it('toCurrencyDeleteBody accepts id or { id }', () => {
    expect(toCurrencyDeleteBody(12)).toEqual({ id: 12 });
    expect(toCurrencyDeleteBody({ id: 12 })).toEqual({ id: 12 });
  });
});
