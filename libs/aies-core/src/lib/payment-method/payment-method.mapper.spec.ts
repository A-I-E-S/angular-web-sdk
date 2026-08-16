import {
  mapPaymentMethod,
  mapPaymentMethodCurrency,
  mapPaymentMethodList,
  PAYMENT_METHOD_READ_PATH,
} from './payment-method.mapper';

/** Abbreviated wire sample from GET /payment_method/read. */
const WIRE_SQUAD = {
  id: 4,
  name: 'Squad',
  model: 'App\\Models\\Squad',
  active: true,
  deleted_at: null,
  created_at: '2024-12-17T12:05:50.000000Z',
  updated_at: '2026-08-14T10:25:14.000000Z',
  currencies: [
    {
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
      pivot: {
        payment_method_id: 4,
        currency_id: 5,
      },
    },
  ],
};

describe('payment-method.mapper', () => {
  it('exposes the payment-method read path', () => {
    expect(PAYMENT_METHOD_READ_PATH).toBe('/payment_method/read');
  });

  it('maps a nested currency with pivot', () => {
    const mapped = mapPaymentMethodCurrency(WIRE_SQUAD.currencies[0]);
    expect(mapped.id).toBe(5);
    expect(mapped.short_code).toBe('NGN');
    expect(mapped.division_rate).toBe('1');
    expect(mapped.pivot).toEqual({
      currency_id: 5,
      payment_method_id: 4,
    });
  });

  it('maps snake_case payment-method fields and nested currencies', () => {
    const mapped = mapPaymentMethod(WIRE_SQUAD);
    expect(mapped.id).toBe(4);
    expect(mapped.name).toBe('Squad');
    expect(mapped.model).toBe('App\\Models\\Squad');
    expect(mapped.active).toBe(true);
    expect(mapped.currencies).toHaveLength(1);
    expect(mapped.currencies[0]?.name).toBe('Naira');
  });

  it('mapPaymentMethodList normalizes arrays and single objects', () => {
    expect(mapPaymentMethodList([WIRE_SQUAD])).toHaveLength(1);
    expect(mapPaymentMethodList(WIRE_SQUAD)[0]?.name).toBe('Squad');
    expect(mapPaymentMethodList(null)).toEqual([]);
  });

  it('defaults missing currencies to an empty list', () => {
    expect(mapPaymentMethod({ id: 1, name: 'X', model: 'App\\X' }).currencies).toEqual(
      [],
    );
  });
});
