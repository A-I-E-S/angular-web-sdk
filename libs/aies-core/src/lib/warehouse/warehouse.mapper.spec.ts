import {
  mapWarehouse,
  mapWarehouseList,
  mapWarehouseState,
  WAREHOUSE_READ_PATH,
} from './warehouse.mapper';

/** Abbreviated wire sample from GET /warehouse/read/all. */
const WIRE_FUSHAN = {
  id: 37,
  partner_id: null,
  name: 'Test China Fushan',
  phone: '+2347008007000',
  email: 'reachus@africanies.com',
  country: {
    id: 46,
    name: 'China',
    iso3: 'CHN',
    iso2: 'CN',
    states: [
      { name: 'Guangdong', state_code: 'GD' },
      { name: 'Beijing', state_code: 'BJ' },
    ],
  },
  api_enabled: '0',
  state: {
    id: 787,
    name: 'Guangdong',
    state_code: 'GD',
    country: 'China',
    country_code: 'CN',
  },
  city: 'Guang Zhou Shi',
  address: 'Citic Plaza',
  longitude: '113.3247658',
  latitude: '23.1423581',
  zip_code: '510620',
  usage: 0,
  active: true,
  deleted_at: null,
  created_at: '2026-07-10T15:37:49.000000Z',
  updated_at: '2026-08-11T11:27:33.000000Z',
  storage_charge: '1500',
  storage_period: '7',
  delivery_charge: '0',
  delivery_count: '2',
  currency: 'NGN',
  etw_shipment_available: false,
  local: false,
  no_shippo: true,
  partner: null,
};

describe('warehouse.mapper', () => {
  it('exposes the warehouse read path', () => {
    expect(WAREHOUSE_READ_PATH).toBe('/warehouse/read');
  });

  it('maps snake_case, string numbers, and api_enabled flags', () => {
    const mapped = mapWarehouse(WIRE_FUSHAN);
    expect(mapped.id).toBe(37);
    expect(mapped.partnerId).toBeNull();
    expect(mapped.name).toBe('Test China Fushan');
    expect(mapped.apiEnabled).toBe(false);
    expect(mapped.zipCode).toBe('510620');
    expect(mapped.longitude).toBeCloseTo(113.3247658);
    expect(mapped.latitude).toBeCloseTo(23.1423581);
    expect(mapped.storageCharge).toBe(1500);
    expect(mapped.storagePeriod).toBe(7);
    expect(mapped.noShippo).toBe(true);
    expect(mapped.country?.iso2).toBe('CN');
    expect(mapped.country?.states[0]?.stateCode).toBe('GD');
    expect(mapped.state).toEqual({
      id: 787,
      name: 'Guangdong',
      stateCode: 'GD',
      country: 'China',
      countryCode: 'CN',
    });
  });

  it('mapWarehouseState returns null for non-objects', () => {
    expect(mapWarehouseState(null)).toBeNull();
  });

  it('mapWarehouseList normalizes arrays and single objects', () => {
    expect(mapWarehouseList([WIRE_FUSHAN])).toHaveLength(1);
    expect(mapWarehouseList(WIRE_FUSHAN)[0]?.city).toBe('Guang Zhou Shi');
    expect(mapWarehouseList(null)).toEqual([]);
  });

  it('treats api_enabled "1" as true', () => {
    expect(mapWarehouse({ ...WIRE_FUSHAN, api_enabled: '1' }).apiEnabled).toBe(
      true,
    );
  });
});
