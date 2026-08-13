/**
 * Zone shapes from utility read endpoints.
 *
 * Domain interfaces in `@aies/aies-models` use a `*Model` suffix.
 * Field names are camelCase in the SDK. Wire payloads may use snake_case;
 * mapping happens once in `@aies/aies-core` ZoneService.
 */

/**
 * Zone record from `GET /zone/read/records/{id|all}`.
 */
export interface ZoneModel {
  /** Numeric zone id. */
  id: number;

  /** Display name (e.g. `"R"`, `"1"`). */
  name: string;

  /** Zone type from the API (e.g. `"standard"`, `"default"`). */
  type: string;

  /** Whether the zone is active. */
  active: boolean;

  /** Soft-delete timestamp, or `null`. */
  deletedAt: string | null;

  /** Created timestamp, or `null`. */
  createdAt: string | null;

  /** Updated timestamp, or `null`. */
  updatedAt: string | null;
}
