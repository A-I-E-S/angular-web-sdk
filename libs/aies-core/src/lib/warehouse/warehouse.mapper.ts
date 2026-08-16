import type {
  CountryModel,
  WarehouseModel,
  WarehouseStateModel,
} from '@aies/aies-models';

import { mapCountry } from '../country/country.mapper';
import { mapApiJsonValue } from '../http/map-api-json';
import {
  asBoolean,
  asNullableNumber,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapList,
} from '../http/wire';

/** Warehouse read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const WAREHOUSE_READ_PATH = '/warehouse/read';

/**
 * Map warehouse state into {@link WarehouseStateModel} (snake_case).
 * @param raw
 */
export function mapWarehouseState(raw: unknown): WarehouseStateModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    state_code: asString(record['state_code'] ?? record['stateCode']),
    country: asString(record['country']),
    country_code: asString(record['country_code'] ?? record['countryCode']),
  };
}

/**
 * Map nested country (same shape as public country utility).
 * @param raw
 */
export function mapWarehouseCountry(raw: unknown): CountryModel | null {
  if (raw == null) {
    return null;
  }
  return mapCountry(raw);
}

/**
 * Map a wire warehouse into {@link WarehouseModel} (snake_case preserved).
 * @param raw
 */
export function mapWarehouse(raw: unknown): WarehouseModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    partner_id: asNullableNumber(record['partner_id'] ?? record['partnerId']),
    name: asString(record['name']),
    phone: asString(record['phone']),
    email: asString(record['email']),
    country: mapWarehouseCountry(record['country']),
    api_enabled: asBoolean(record['api_enabled'] ?? record['apiEnabled']),
    state: mapWarehouseState(record['state']),
    city: asString(record['city']),
    address: asString(record['address']),
    longitude: asNumber(record['longitude']),
    latitude: asNumber(record['latitude']),
    zip_code: asString(record['zip_code'] ?? record['zipCode']),
    usage: asNumber(record['usage']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    storage_charge: asNumber(
      record['storage_charge'] ?? record['storageCharge'],
    ),
    storage_period: asNumber(
      record['storage_period'] ?? record['storagePeriod'],
    ),
    delivery_charge: asNumber(
      record['delivery_charge'] ?? record['deliveryCharge'],
    ),
    delivery_count: asNumber(
      record['delivery_count'] ?? record['deliveryCount'],
    ),
    currency: asString(record['currency']),
    etw_shipment_available: asBoolean(
      record['etw_shipment_available'] ?? record['etwShipmentAvailable'],
    ),
    local: asBoolean(record['local']),
    no_shippo: asBoolean(record['no_shippo'] ?? record['noShippo']),
    partner: mapApiJsonValue(record['partner']),
  };
}

/**
 * Map a list (or single object) payload into {@link WarehouseModel}[].
 * @param raw
 */
export function mapWarehouseList(raw: unknown): WarehouseModel[] {
  return mapList(raw, mapWarehouse);
}
