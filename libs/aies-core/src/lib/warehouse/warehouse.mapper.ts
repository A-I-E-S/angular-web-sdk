import type {
  CountryModel,
  WarehouseModel,
  WarehouseStateModel,
} from '@aies/aies-models';

import { mapCountry } from '../country/country.mapper';
import { mapApiJsonValue } from '../http/map-api-json';

/** Warehouse read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const WAREHOUSE_READ_PATH = '/warehouse/read';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asFlag01(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value ?? '').trim() === '1';
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

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
    name: String(record['name'] ?? ''),
    state_code: String(record['state_code'] ?? record['stateCode'] ?? ''),
    country: String(record['country'] ?? ''),
    country_code: String(
      record['country_code'] ?? record['countryCode'] ?? '',
    ),
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

  const partnerIdRaw = record['partner_id'] ?? record['partnerId'];
  const partner_id =
    partnerIdRaw == null || partnerIdRaw === ''
      ? null
      : asNumber(partnerIdRaw);

  return {
    id: asNumber(record['id']),
    partner_id,
    name: String(record['name'] ?? ''),
    phone: String(record['phone'] ?? ''),
    email: String(record['email'] ?? ''),
    country: mapWarehouseCountry(record['country']),
    api_enabled: asFlag01(record['api_enabled'] ?? record['apiEnabled']),
    state: mapWarehouseState(record['state']),
    city: String(record['city'] ?? ''),
    address: String(record['address'] ?? ''),
    longitude: asNumber(record['longitude']),
    latitude: asNumber(record['latitude']),
    zip_code: String(record['zip_code'] ?? record['zipCode'] ?? ''),
    usage: asNumber(record['usage']),
    active: Boolean(record['active']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
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
    currency: String(record['currency'] ?? ''),
    etw_shipment_available: Boolean(
      record['etw_shipment_available'] ?? record['etwShipmentAvailable'],
    ),
    local: Boolean(record['local']),
    no_shippo: Boolean(record['no_shippo'] ?? record['noShippo']),
    partner: mapApiJsonValue(record['partner']),
  };
}

/**
 * Map a list (or single object) payload into {@link WarehouseModel}[].
 * @param raw
 */
export function mapWarehouseList(raw: unknown): WarehouseModel[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapWarehouse(entry));
  }
  return [mapWarehouse(raw)];
}
