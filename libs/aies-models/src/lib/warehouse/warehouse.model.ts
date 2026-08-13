import type { ApiJsonValue } from '../api/api-json.model';
import type { CountryModel } from '../country/country.model';

/**
 * Warehouse shapes from utility read endpoints.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names are camelCase in the SDK. Wire payloads may use snake_case;
 * mapping happens once in `@aies/aies-core` WarehouseService.
 */

/**
 * Subdivision attached to a warehouse (includes country name/code).
 */
export interface WarehouseStateModel {
  /** State id from the API. */
  id: number;

  /** Display name (e.g. `"Guangdong"`). */
  name: string;

  /** Subdivision code — mapped from wire `state_code`. */
  stateCode: string;

  /** Country display name on the wire (e.g. `"China"`). */
  country: string;

  /** ISO 3166-1 alpha-2 — mapped from wire `country_code`. */
  countryCode: string;
}

/**
 * Warehouse record from `GET /warehouse/read/{id|all}`.
 */
export interface WarehouseModel {
  /** Numeric warehouse id. */
  id: number;

  /** Linked partner id when present. */
  partnerId: number | null;

  /** Display name. */
  name: string;

  /** Contact phone. */
  phone: string;

  /** Contact email. */
  email: string;

  /** Nested country (ISO + states), or `null`. */
  country: CountryModel | null;

  /** Whether API integrations are enabled (wire `"0"` / `"1"`). */
  apiEnabled: boolean;

  /** Selected state for the warehouse address, or `null`. */
  state: WarehouseStateModel | null;

  /** City name. */
  city: string;

  /** Full street / postal address. */
  address: string;

  /** Longitude. */
  longitude: number;

  /** Latitude. */
  latitude: number;

  /** Postal / ZIP code — mapped from wire `zip_code`. */
  zipCode: string;

  /** Usage counter from the API. */
  usage: number;

  /** Whether the warehouse is active. */
  active: boolean;

  /** Soft-delete timestamp, or `null`. */
  deletedAt: string | null;

  /** Created timestamp, or `null`. */
  createdAt: string | null;

  /** Updated timestamp, or `null`. */
  updatedAt: string | null;

  /** Storage charge amount. */
  storageCharge: number;

  /** Storage period (days). */
  storagePeriod: number;

  /** Delivery charge amount. */
  deliveryCharge: number;

  /** Included delivery count. */
  deliveryCount: number;

  /** Currency code (e.g. `"NGN"`). */
  currency: string;

  /** Whether ETW shipment is available. */
  etwShipmentAvailable: boolean;

  /** Whether this is a local warehouse. */
  local: boolean;

  /** When true, Shippo is not used for this warehouse. */
  noShippo: boolean;

  /**
   * Nested partner payload when present (null-safe JSON tree).
   * Shape varies by partner type — dedicated partner model can replace this later.
   */
  partner: ApiJsonValue | null;
}
