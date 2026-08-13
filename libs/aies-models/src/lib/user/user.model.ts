import type { ApiJsonValue } from '../api/api-json.model';
import type { CountryModel } from '../country/country.model';

/**
 * Authenticated user shapes from `GET /user`.
 *
 * The wire response is a bare user object (no `{ success, data }` envelope).
 * {@link ApiClient} still normalizes it into {@link ApiResponseModel}; mapping
 * to camelCase happens in `@aies/aies-core` UserService.
 */

/**
 * Subdivision on the user profile when present.
 */
export interface UserStateModel {
  /** State id from the API. */
  id: number;

  /** Display name. */
  name: string;

  /** Subdivision code — mapped from wire `state_code`. */
  stateCode: string;

  /** Country display name on the wire. */
  country: string;

  /** ISO 3166-1 alpha-2 — mapped from wire `country_code`. */
  countryCode: string;
}

/**
 * Current user from `GET /user` (auth required).
 */
export interface UserModel {
  /** Numeric user id. */
  id: number;

  /** Central / SSO id (UUID string). */
  centralId: string;

  /** Full display name. */
  name: string;

  /** Given name. */
  firstName: string;

  /** Middle name when present. */
  middleName: string | null;

  /** Family name. */
  lastName: string;

  /** Primary email. */
  email: string;

  /** Phone number. */
  phone: string;

  /** Unit / customer number (may mirror email). */
  unitNumber: string;

  /** Referral code. */
  referralCode: string;

  /** Previous unit number when migrated. */
  oldUnitNumber: string | null;

  /** Alternate account email when set. */
  accountEmail: string | null;

  /** Whether two-factor auth is enabled. */
  twoFactor: boolean;

  /** Whether the user still has the default PIN. */
  defaultPin: boolean;

  /** Backend model class name (e.g. `App\\Models\\Admin`). */
  model: string;

  /** Nested country, or `null`. */
  country: CountryModel | null;

  /** Selected state, or `null`. */
  state: UserStateModel | null;

  /** Email verification timestamp. */
  emailVerifiedAt: string | null;

  /** Phone verification timestamp. */
  phoneVerifiedAt: string | null;

  /** KYC verification timestamp. */
  kycVerifiedAt: string | null;

  /** Passport verification timestamp. */
  passportVerifiedAt: string | null;

  /** Suspension timestamp. */
  suspendedAt: string | null;

  /** Deactivation timestamp. */
  deactivatedAt: string | null;

  /** Whether the account is active. */
  active: boolean;

  /** Whether the user still has the default password. */
  defaultPassword: boolean;

  /** Account type (e.g. `"individual"`). */
  type: string;

  /** Soft-delete timestamp. */
  deletedAt: string | null;

  /** Created timestamp. */
  createdAt: string | null;

  /** Updated timestamp. */
  updatedAt: string | null;

  /** Last login timestamp (format varies on the wire). */
  lastLoginAt: string | null;

  /** Signed up via socialite (wire `0` / `1`). */
  socialiteSignup: boolean;

  /** Signed up via form (wire `0` / `1`). */
  formSignup: boolean;

  /** Main region code (e.g. `"ng"`). */
  mainRegion: string;

  /** Shipping preference (e.g. `"consolidation"`). */
  shippingType: string;

  /** Linked accounts list (opaque until a dedicated account model lands). */
  accounts: ApiJsonValue[];

  /** Business account payload when present (null-safe JSON tree). */
  businessAccount: ApiJsonValue | null;

  /** Account manager payload when present (null-safe JSON tree). */
  accountManager: ApiJsonValue | null;
}
