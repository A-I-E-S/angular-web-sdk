import type {
  ShipmentMethodModel,
  ShipmentMethodZoneLinkModel,
  ShipmentMethodZonePageModel,
  ShipmentZoneModel,
  ShippingMode,
} from '@aies/aies-models';

/** Shipment-method read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const SHIPMENT_METHOD_READ_PATH = '/shipment_method/read';

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
 * Coerce wire yes/no (or boolean) into a boolean.
 * @param value - Raw flag.
 * @returns `true` only for boolean `true` or string `"yes"` (case-insensitive).
 */
function asYesNo(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'yes';
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
 * Coerce shipping mode; unknown values fall back to `'sfn'`.
 * @param value - Raw mode string.
 * @returns `'stn'` or `'sfn'`.
 */
function asShippingMode(value: unknown): ShippingMode {
  return value === 'stn' ? 'stn' : 'sfn';
}

/**
 * Map a nested zone object into {@link ShipmentZoneModel}.
 * @param raw - Zone object from the wire (camel or snake case).
 * @returns Normalized zone, or `null` when `raw` is not an object.
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
 * @param raw - Link row from `zone_values.data`.
 * @returns Normalized link.
 */
export function mapShipmentMethodZoneLink(
  raw: unknown,
): ShipmentMethodZoneLinkModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    zoneId: asNumber(record['zoneId'] ?? record['zone_id']),
    shipmentMethodId: asNumber(
      record['shipmentMethodId'] ?? record['shipment_method_id'],
    ),
    active: Boolean(record['active']),
    mode: asShippingMode(record['mode']),
    zone: mapShipmentZone(record['zone']),
  };
}

/**
 * Map a Laravel-style `zone_values` page into {@link ShipmentMethodZonePageModel}.
 * @param raw - Paginated zone payload (or null/undefined).
 * @returns Normalized page (empty when missing).
 */
export function mapShipmentMethodZonePage(
  raw: unknown,
): ShipmentMethodZonePageModel {
  const record = asRecord(raw);
  if (record === null) {
    return {
      items: [],
      currentPage: 0,
      perPage: 0,
      total: 0,
      lastPage: 0,
    };
  }

  const data = record['data'] ?? record['items'];
  const items = Array.isArray(data)
    ? data.map((entry) => mapShipmentMethodZoneLink(entry))
    : [];

  return {
    items,
    currentPage: asNumber(record['currentPage'] ?? record['current_page']),
    perPage: asNumber(record['perPage'] ?? record['per_page']),
    total: asNumber(record['total']),
    lastPage: asNumber(record['lastPage'] ?? record['last_page']),
  };
}

/**
 * Map a wire shipment method into {@link ShipmentMethodModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - Method object from the wire.
 * @returns Normalized {@link ShipmentMethodModel}.
 */
export function mapShipmentMethod(raw: unknown): ShipmentMethodModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: String(record['name'] ?? ''),
    slug: String(record['slug'] ?? ''),
    model: String(record['model'] ?? ''),
    minDeliveryBusinessDay: asNumber(
      record['minDeliveryBusinessDay'] ?? record['min_delivery_business_day'],
    ),
    maxDeliveryBusinessDay: asNumber(
      record['maxDeliveryBusinessDay'] ?? record['max_delivery_business_day'],
    ),
    notes: String(record['notes'] ?? ''),
    blacklistedWords: (() => {
      const value = record['blacklistedWords'] ?? record['blacklisted_words'];
      if (value == null) {
        return null;
      }
      return String(value);
    })(),
    position: asNumber(record['position']),
    minWeight: asNumber(record['minWeight'] ?? record['min_weight']),
    maxWeight: asNumber(record['maxWeight'] ?? record['max_weight']),
    maxLength: asNumber(record['maxLength'] ?? record['max_length']),
    maxWidth: asNumber(record['maxWidth'] ?? record['max_width']),
    maxHeight: asNumber(record['maxHeight'] ?? record['max_height']),
    markup: asNumber(record['markup']),
    surcharge: asNumber(record['surcharge']),
    insuranceBenchmark: asNumber(
      record['insuranceBenchmark'] ?? record['insurance_benchmark'],
    ),
    insurance: asNumber(record['insurance']),
    clearingHandling: asNumber(
      record['clearingHandling'] ?? record['clearing_handling'],
    ),
    destination: String(record['destination'] ?? ''),
    seaOnly: asYesNo(record['seaOnly'] ?? record['sea_only']),
    currency: String(record['currency'] ?? ''),
    type: String(record['type'] ?? ''),
    active: Boolean(record['active']),
    multipleRates: Boolean(
      record['multipleRates'] ?? record['multiple_rates'],
    ),
    firstShipmentDiscount: asNumber(
      record['firstShipmentDiscount'] ?? record['first_shipment_discount'],
    ),
    discountType: String(
      record['discountType'] ?? record['discount_type'] ?? '',
    ),
    discountActive: Boolean(
      record['discountActive'] ?? record['discount_active'],
    ),
    mode: asShippingMode(record['mode']),
    deletedAt: asNullableString(
      record['deletedAt'] ?? record['deleted_at'],
    ),
    createdAt: asNullableString(
      record['createdAt'] ?? record['created_at'],
    ),
    updatedAt: asNullableString(
      record['updatedAt'] ?? record['updated_at'],
    ),
    markdown: asNumber(record['markdown']),
    zoneValues: mapShipmentMethodZonePage(
      record['zoneValues'] ?? record['zone_values'],
    ),
  };
}

/**
 * Map a list (or single object) payload into {@link ShipmentMethodModel}[].
 *
 * @param raw - `data` payload from `/shipment_method/read/{id|all}`.
 * @returns Mapped method list (empty when `raw` is null/undefined).
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
