import {
  mapShipmentMethod,
  mapShipmentMethodList,
  mapShipmentMethodZonePage,
  mapShipmentZone,
  SHIPMENT_METHOD_READ_PATH,
} from './shipment-method.mapper';

/** Abbreviated wire sample from GET /shipment_method/read/all. */
const WIRE_AIR_EXPEDITED = {
  id: 12,
  name: 'Africanies Air Expedited',
  slug: 'africanies_air_expedited_sfn',
  model: 'App\\Models\\AfricaniesAirExpedited',
  min_delivery_business_day: '4',
  max_delivery_business_day: '7',
  notes: '-',
  blacklisted_words: null,
  position: 0,
  min_weight: '0.5',
  max_weight: '1000000',
  max_length: '75',
  max_width: '75',
  max_height: '75',
  markup: '10',
  surcharge: '0',
  insurance_benchmark: '100',
  insurance: '1.5',
  clearing_handling: '0',
  destination: 'international',
  sea_only: 'no',
  currency: 'NGN',
  type: 'default',
  active: true,
  multiple_rates: false,
  first_shipment_discount: 5,
  discount_type: 'percentage',
  discount_active: true,
  mode: 'sfn',
  deleted_at: null,
  created_at: '2026-06-03T14:26:25.000000Z',
  updated_at: '2026-06-04T07:12:27.000000Z',
  markdown: 30,
  zone_values: {
    current_page: 1,
    data: [
      {
        id: 57,
        zone_id: 10,
        shipment_method_id: 12,
        active: true,
        mode: 'sfn',
        zone: {
          id: 10,
          name: '1',
          type: 'default',
          active: true,
        },
      },
    ],
    per_page: 10,
    last_page: 122,
    total: 1216,
  },
};

describe('shipment-method.mapper', () => {
  it('exposes the shipment-method read path', () => {
    expect(SHIPMENT_METHOD_READ_PATH).toBe('/shipment_method/read');
  });

  it('maps nested zones and coerces string numbers / yes-no', () => {
    const mapped = mapShipmentMethod(WIRE_AIR_EXPEDITED);
    expect(mapped.id).toBe(12);
    expect(mapped.name).toBe('Africanies Air Expedited');
    expect(mapped.min_delivery_business_day).toBe(4);
    expect(mapped.min_weight).toBe(0.5);
    expect(mapped.sea_only).toBe(false);
    expect(mapped.mode).toBe('sfn');
    expect(mapped.discount_type).toBe('percentage');
    expect(mapped.zone_values.total).toBe(1216);
    expect(mapped.zone_values.data).toHaveLength(1);
    expect(mapped.zone_values.data[0]).toEqual({
      id: 57,
      zone_id: 10,
      shipment_method_id: 12,
      active: true,
      mode: 'sfn',
      zone: { id: 10, name: '1', type: 'default', active: true },
    });
  });

  it('mapShipmentZone returns null for non-objects', () => {
    expect(mapShipmentZone(null)).toBeNull();
    expect(mapShipmentZone('x')).toBeNull();
  });

  it('mapShipmentMethodZonePage returns an empty page for null', () => {
    expect(mapShipmentMethodZonePage(null)).toEqual({
      data: [],
      current_page: 0,
      per_page: 0,
      total: 0,
      last_page: 0,
    });
  });

  it('mapShipmentMethodList normalizes arrays and single objects', () => {
    expect(mapShipmentMethodList([WIRE_AIR_EXPEDITED])).toHaveLength(1);
    expect(mapShipmentMethodList(WIRE_AIR_EXPEDITED)[0]?.slug).toBe(
      'africanies_air_expedited_sfn',
    );
    expect(mapShipmentMethodList(null)).toEqual([]);
  });

  it('accepts already-camelCased payloads', () => {
    const mapped = mapShipmentMethod({
      id: 1,
      name: 'Sea',
      slug: 'sea',
      model: '',
      min_delivery_business_day: 10,
      max_delivery_business_day: 20,
      notes: '',
      blacklisted_words: null,
      position: 1,
      min_weight: 1,
      max_weight: 2,
      max_length: 3,
      max_width: 4,
      max_height: 5,
      markup: 0,
      surcharge: 0,
      insurance_benchmark: 0,
      insurance: 0,
      clearing_handling: 0,
      destination: 'domestic',
      sea_only: true,
      currency: 'USD',
      type: 'default',
      active: true,
      multiple_rates: true,
      first_shipment_discount: 0,
      discount_type: 'fixed',
      discount_active: false,
      mode: 'stn',
      deleted_at: null,
      created_at: null,
      updated_at: null,
      markdown: 0,
      zone_values: { data: [], current_page: 1, per_page: 10, total: 0, last_page: 1 },
    });
    expect(mapped.sea_only).toBe(true);
    expect(mapped.mode).toBe('stn');
    expect(mapped.zone_values.last_page).toBe(1);
  });
});
