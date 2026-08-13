import type {
  ShipmentMethodModel,
  ShipmentMethodZoneLinkModel,
  ShipmentMethodZonePageModel,
  ShipmentZoneModel,
  ShippingMode,
} from '@aies/aies-models';

/** Shipment-method read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const SHIPMENT_METHOD_READ_PATH = '/shipment_method/read';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asYesNo(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'yes';
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asNullableString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  return String(value);
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
    name: String(record['name'] ?? ''),
    type: String(record['type'] ?? ''),
    active: Boolean(record['active']),
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
    active: Boolean(record['active']),
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

  const rows = record['data'] ?? record['items'];
  const data = Array.isArray(rows)
    ? rows.map((entry) => mapShipmentMethodZoneLink(entry))
    : [];

  return {
    data,
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
    name: String(record['name'] ?? ''),
    slug: String(record['slug'] ?? ''),
    model: String(record['model'] ?? ''),
    min_delivery_business_day: asNumber(
      record['min_delivery_business_day'] ??
        record['minDeliveryBusinessDay'],
    ),
    max_delivery_business_day: asNumber(
      record['max_delivery_business_day'] ??
        record['maxDeliveryBusinessDay'],
    ),
    notes: String(record['notes'] ?? ''),
    blacklisted_words: (() => {
      const value = record['blacklisted_words'] ?? record['blacklistedWords'];
      if (value == null) {
        return null;
      }
      return String(value);
    })(),
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
    destination: String(record['destination'] ?? ''),
    sea_only: asYesNo(record['sea_only'] ?? record['seaOnly']),
    currency: String(record['currency'] ?? ''),
    type: String(record['type'] ?? ''),
    active: Boolean(record['active']),
    multiple_rates: Boolean(
      record['multiple_rates'] ?? record['multipleRates'],
    ),
    first_shipment_discount: asNumber(
      record['first_shipment_discount'] ?? record['firstShipmentDiscount'],
    ),
    discount_type: String(
      record['discount_type'] ?? record['discountType'] ?? '',
    ),
    discount_active: Boolean(
      record['discount_active'] ?? record['discountActive'],
    ),
    mode: asShippingMode(record['mode']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
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
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapShipmentMethod(entry));
  }
  return [mapShipmentMethod(raw)];
}
