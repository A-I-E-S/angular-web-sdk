import type {
  CountryModel,
  WarehouseModel,
  WarehouseStateModel,
} from '@aies/aies-models';

import { mapCountry } from '../country/country.mapper';
import { mapApiJsonValue } from '../http/map-api-json';

/** Warehouse read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const WAREHOUSE_READ_PATH = '/warehouse/read';

/**
 * Narrow unknown JSON into a record for defensive key reads.
 * @param value - Candidate JSON value.
 * @returns A record when `value` is a plain object; otherwise `null`.
 */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/**
 * Coerce a wire number that may arrive as a string.
 * @param value - Raw numeric field.
 * @returns Finite number, or `0` when missing/invalid.
 */
function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Coerce `"0"` / `"1"` / boolean into a boolean.
 * @param value - Raw flag.
 * @returns `true` for boolean `true` or string `"1"`.
 */
function asFlag01(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value ?? '').trim() === '1';
}

/**
 * Coerce a nullable string field (missing → `null`).
 * @param value - Raw string field.
 * @returns String or `null`.
 */
function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
}

/**
 * Map warehouse state into {@link WarehouseStateModel}.
 * @param raw - State object from the wire.
 * @returns Normalized state, or `null` when `raw` is not an object.
 */
export function mapWarehouseState(raw: unknown): WarehouseStateModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNumber(record['id']),
    name: String(record['name'] ?? ''),
    stateCode: String(record['stateCode'] ?? record['state_code'] ?? ''),
    country: String(record['country'] ?? ''),
    countryCode: String(
      record['countryCode'] ?? record['country_code'] ?? '',
    ),
  };
}

/**
 * Map nested country (same shape as public country utility).
 * @param raw - Country object from the wire.
 * @returns Mapped {@link CountryModel}, or `null`.
 */
export function mapWarehouseCountry(raw: unknown): CountryModel | null {
  if (raw == null) {
    return null;
  }
  return mapCountry(raw);
}

/**
 * Map a wire warehouse into {@link WarehouseModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - Warehouse object from the wire.
 * @returns Normalized {@link WarehouseModel}.
 */
export function mapWarehouse(raw: unknown): WarehouseModel {
  const record = asRecord(raw) ?? {};

  const partnerIdRaw = record['partnerId'] ?? record['partner_id'];
  const partnerId =
    partnerIdRaw == null || partnerIdRaw === ''
      ? null
      : asNumber(partnerIdRaw);

  return {
    id: asNumber(record['id']),
    partnerId,
    name: String(record['name'] ?? ''),
    phone: String(record['phone'] ?? ''),
    email: String(record['email'] ?? ''),
    country: mapWarehouseCountry(record['country']),
    apiEnabled: asFlag01(record['apiEnabled'] ?? record['api_enabled']),
    state: mapWarehouseState(record['state']),
    city: String(record['city'] ?? ''),
    address: String(record['address'] ?? ''),
    longitude: asNumber(record['longitude']),
    latitude: asNumber(record['latitude']),
    zipCode: String(record['zipCode'] ?? record['zip_code'] ?? ''),
    usage: asNumber(record['usage']),
    active: Boolean(record['active']),
    deletedAt: asNullableString(
      record['deletedAt'] ?? record['deleted_at'],
    ),
    createdAt: asNullableString(
      record['createdAt'] ?? record['created_at'],
    ),
    updatedAt: asNullableString(
      record['updatedAt'] ?? record['updated_at'],
    ),
    storageCharge: asNumber(
      record['storageCharge'] ?? record['storage_charge'],
    ),
    storagePeriod: asNumber(
      record['storagePeriod'] ?? record['storage_period'],
    ),
    deliveryCharge: asNumber(
      record['deliveryCharge'] ?? record['delivery_charge'],
    ),
    deliveryCount: asNumber(
      record['deliveryCount'] ?? record['delivery_count'],
    ),
    currency: String(record['currency'] ?? ''),
    etwShipmentAvailable: Boolean(
      record['etwShipmentAvailable'] ?? record['etw_shipment_available'],
    ),
    local: Boolean(record['local']),
    noShippo: Boolean(record['noShippo'] ?? record['no_shippo']),
    partner: mapApiJsonValue(record['partner']),
  };
}

/**
 * Map a list (or single object) payload into {@link WarehouseModel}[].
 *
 * @param raw - `data` payload from `/warehouse/read/{id|all}`.
 * @returns Mapped warehouse list (empty when `raw` is null/undefined).
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
