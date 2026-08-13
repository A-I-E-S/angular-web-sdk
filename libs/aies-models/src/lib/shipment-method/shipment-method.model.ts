import type { ShippingMode } from '../shipping/shipping-mode.model';

/**
 * Shipment method (carrier) shapes from utility read endpoints.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names are camelCase in the SDK. Wire payloads may use snake_case;
 * mapping happens once in `@aies/aies-core` ShipmentMethodService.
 */

/**
 * Geographic zone nested under a method↔zone link.
 */
export interface ShipmentZoneModel {
  /** Zone id. */
  id: number;

  /** Display name (often a numeric label like `"1"`). */
  name: string;

  /** Zone type from the API (e.g. `"default"`). */
  type: string;

  /** Whether the zone is active. */
  active: boolean;
}

/**
 * Link row tying a shipment method to a {@link ShipmentZoneModel}.
 */
export interface ShipmentMethodZoneLinkModel {
  /** Link row id. */
  id: number;

  /** Foreign key to the zone. */
  zoneId: number;

  /** Foreign key to the shipment method. */
  shipmentMethodId: number;

  /** Whether this link is active. */
  active: boolean;

  /** Shipping mode for this link (`stn` / `sfn`). */
  mode: ShippingMode;

  /** Nested zone when the API includes it; otherwise `null`. */
  zone: ShipmentZoneModel | null;
}

/**
 * One Laravel-style page of zone links embedded on a method payload.
 *
 * `read/all` typically returns the first page only; use `total` / `lastPage`
 * when the consumer needs to know more pages exist.
 */
export interface ShipmentMethodZonePageModel {
  /** Rows on this page. */
  items: ShipmentMethodZoneLinkModel[];

  /** 1-based page index. */
  currentPage: number;

  /** Page size. */
  perPage: number;

  /** Total matching links across all pages. */
  total: number;

  /** Last page index. */
  lastPage: number;
}

/**
 * Carrier / shipment method from `GET /shipment_method/read/{id|all}`.
 */
export interface ShipmentMethodModel {
  /** Numeric method id. */
  id: number;

  /** Display name (e.g. `"Africanies Air Expedited"`). */
  name: string;

  /** URL-safe slug (often includes mode suffix). */
  slug: string;

  /** Backend model class name when provided. */
  model: string;

  /** Minimum delivery business days. */
  minDeliveryBusinessDay: number;

  /** Maximum delivery business days. */
  maxDeliveryBusinessDay: number;

  /** Free-form notes (`"-"` when empty on the wire). */
  notes: string;

  /** Comma-separated blacklist, or `null`. */
  blacklistedWords: string | null;

  /** Sort / display position. */
  position: number;

  /** Minimum accepted weight. */
  minWeight: number;

  /** Maximum accepted weight. */
  maxWeight: number;

  /** Max package length. */
  maxLength: number;

  /** Max package width. */
  maxWidth: number;

  /** Max package height. */
  maxHeight: number;

  /** Markup percentage or amount (API numeric). */
  markup: number;

  /** Flat surcharge. */
  surcharge: number;

  /** Insurance benchmark value. */
  insuranceBenchmark: number;

  /** Insurance rate. */
  insurance: number;

  /** Clearing / handling fee. */
  clearingHandling: number;

  /** Destination scope (e.g. `"international"`). */
  destination: string;

  /** Whether the method is sea-only (wire `"yes"` / `"no"`). */
  seaOnly: boolean;

  /** Currency code (e.g. `"NGN"`). */
  currency: string;

  /** Method type (e.g. `"default"`). */
  type: string;

  /** Whether the method is active. */
  active: boolean;

  /** Whether multiple rates apply. */
  multipleRates: boolean;

  /** First-shipment discount amount. */
  firstShipmentDiscount: number;

  /** Discount kind (e.g. `"percentage"`). */
  discountType: string;

  /** Whether the first-shipment discount is active. */
  discountActive: boolean;

  /** Shipping mode (`stn` / `sfn`). */
  mode: ShippingMode;

  /** Soft-delete timestamp, or `null`. */
  deletedAt: string | null;

  /** Created timestamp, or `null`. */
  createdAt: string | null;

  /** Updated timestamp, or `null`. */
  updatedAt: string | null;

  /** Markdown / markdown amount from the API. */
  markdown: number;

  /** First page of zone links (`zone_values` on the wire). */
  zoneValues: ShipmentMethodZonePageModel;
}
