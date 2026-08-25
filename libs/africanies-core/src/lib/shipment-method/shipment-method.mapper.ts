import type {
  ShipmentMethodModel,
  ShipmentMethodZoneLinkModel,
  ShipmentMethodZonePageModel,
  ShipmentZoneModel,
  ShippingMode,
} from '@africanies/africanies-models';

import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
} from '../http/wire';

/** Shipment-method read base path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const SHIPMENT_METHOD_READ_PATH = '/shipment_method/read';

function asYesNo(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return asString(value).trim().toLowerCase() === 'yes';
}

function asShippingMode(value: unknown): ShippingMode {
  return value === 'stn' ? 'stn' : 'sfn';
}

/**
 * Map a nested zone object into {@link ShipmentZoneModel}.
 * @param raw
 */
export function mapShipmentZone(raw: unknown): ShipmentZoneModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    type: asString(record['type']),
    active: asBoolean(record['active']),
  };
}

/**
 * Map a method↔zone link into {@link ShipmentMethodZoneLinkModel}.
 * @param raw
 */
export function mapShipmentMethodZoneLink(
  raw: unknown,
): ShipmentMethodZoneLinkModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    zone_id: asNumber(record['zone_id'] ?? record['zoneId']),
    shipment_method_id: asNumber(
      record['shipment_method_id'] ?? record['shipmentMethodId'],
    ),
    active: asBoolean(record['active']),
    mode: asShippingMode(record['mode']),
    zone: mapShipmentZone(record['zone']),
  };
}

/**
 * Map a Laravel-style `zone_values` page into {@link ShipmentMethodZonePageModel}.
 * @param raw
 */
export function mapShipmentMethodZonePage(
  raw: unknown,
): ShipmentMethodZonePageModel {
  const record = asRecord(raw);
  if (record === null) {
    return {
      data: [],
      current_page: 0,
      per_page: 0,
      total: 0,
      last_page: 0,
    };
  }

  return {
    data: mapArray(
      record['data'] ?? record['items'],
      mapShipmentMethodZoneLink,
    ),
    current_page: asNumber(record['current_page'] ?? record['currentPage']),
    per_page: asNumber(record['per_page'] ?? record['perPage']),
    total: asNumber(record['total']),
    last_page: asNumber(record['last_page'] ?? record['lastPage']),
  };
}

/**
 * Map a wire shipment method into {@link ShipmentMethodModel} (snake_case).
 * @param raw
 */
export function mapShipmentMethod(raw: unknown): ShipmentMethodModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    slug: asString(record['slug']),
    model: asString(record['model']),
    min_delivery_business_day: asNumber(
      record['min_delivery_business_day'] ?? record['minDeliveryBusinessDay'],
    ),
    max_delivery_business_day: asNumber(
      record['max_delivery_business_day'] ?? record['maxDeliveryBusinessDay'],
    ),
    notes: asString(record['notes']),
    blacklisted_words: asNullableString(
      record['blacklisted_words'] ?? record['blacklistedWords'],
    ),
    position: asNumber(record['position']),
    min_weight: asNumber(record['min_weight'] ?? record['minWeight']),
    max_weight: asNumber(record['max_weight'] ?? record['maxWeight']),
    max_length: asNumber(record['max_length'] ?? record['maxLength']),
    max_width: asNumber(record['max_width'] ?? record['maxWidth']),
    max_height: asNumber(record['max_height'] ?? record['maxHeight']),
    markup: asNumber(record['markup']),
    surcharge: asNumber(record['surcharge']),
    insurance_benchmark: asNumber(
      record['insurance_benchmark'] ?? record['insuranceBenchmark'],
    ),
    insurance: asNumber(record['insurance']),
    clearing_handling: asNumber(
      record['clearing_handling'] ?? record['clearingHandling'],
    ),
    destination: asString(record['destination']),
    sea_only: asYesNo(record['sea_only'] ?? record['seaOnly']),
    currency: asString(record['currency']),
    type: asString(record['type']),
    active: asBoolean(record['active']),
    multiple_rates: asBoolean(record['multiple_rates'] ?? record['multipleRates']),
    first_shipment_discount: asNumber(
      record['first_shipment_discount'] ?? record['firstShipmentDiscount'],
    ),
    discount_type: asString(record['discount_type'] ?? record['discountType']),
    discount_active: asBoolean(
      record['discount_active'] ?? record['discountActive'],
    ),
    mode: asShippingMode(record['mode']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    markdown: asNumber(record['markdown']),
    zone_values: mapShipmentMethodZonePage(
      record['zone_values'] ?? record['zoneValues'],
    ),
  };
}

/**
 * Map a list (or single object) payload into {@link ShipmentMethodModel}[].
 * @param raw
 */
export function mapShipmentMethodList(raw: unknown): ShipmentMethodModel[] {
  return mapList(raw, mapShipmentMethod);
}
