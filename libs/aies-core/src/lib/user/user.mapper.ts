import type {
  CountryModel,
  UserModel,
  UserStateModel,
} from '@aies/aies-models';

import { mapCountry } from '../country/country.mapper';
import { mapApiJsonList, mapApiJsonValue } from '../http/map-api-json';

/** Current-user path (relative to {@link AiesSdkConfig.baseUrl}). */
export const USER_PATH = '/user';

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
 * Coerce `"0"` / `"1"` / numeric / boolean into a boolean.
 * @param value - Raw flag.
 * @returns `true` for boolean `true`, number `1`, or string `"1"`.
 */
function asFlag01(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return String(value ?? '').trim() === '1';
}

/**
 * Nullable string from wire (empty string stays empty; null stays null).
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
 * Map user state into {@link UserStateModel}.
 * @param raw - State object from the wire.
 * @returns Normalized state, or `null`.
 */
export function mapUserState(raw: unknown): UserStateModel | null {
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
export function mapUserCountry(raw: unknown): CountryModel | null {
  if (raw == null) {
    return null;
  }
  return mapCountry(raw);
}

/**
 * Map a bare wire user object into {@link UserModel}.
 * Accepts already-camelCased payloads so double-mapping is harmless.
 * @param raw - User object from `GET /user` (unwrapped).
 * @returns Normalized {@link UserModel}.
 */
export function mapUser(raw: unknown): UserModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    centralId: String(record['centralId'] ?? record['central_id'] ?? ''),
    name: String(record['name'] ?? ''),
    firstName: String(record['firstName'] ?? record['first_name'] ?? ''),
    middleName: asNullableString(
      record['middleName'] ?? record['middle_name'],
    ),
    lastName: String(record['lastName'] ?? record['last_name'] ?? ''),
    email: String(record['email'] ?? ''),
    phone: String(record['phone'] ?? ''),
    unitNumber: String(record['unitNumber'] ?? record['unit_number'] ?? ''),
    referralCode: String(
      record['referralCode'] ?? record['referral_code'] ?? '',
    ),
    oldUnitNumber: asNullableString(
      record['oldUnitNumber'] ?? record['old_unit_number'],
    ),
    accountEmail: asNullableString(
      record['accountEmail'] ?? record['account_email'],
    ),
    twoFactor: Boolean(record['twoFactor'] ?? record['two_factor']),
    defaultPin: Boolean(record['defaultPin'] ?? record['default_pin']),
    model: String(record['model'] ?? ''),
    country: mapUserCountry(record['country']),
    state: mapUserState(record['state']),
    emailVerifiedAt: asNullableString(
      record['emailVerifiedAt'] ?? record['email_verified_at'],
    ),
    phoneVerifiedAt: asNullableString(
      record['phoneVerifiedAt'] ?? record['phone_verified_at'],
    ),
    kycVerifiedAt: asNullableString(
      record['kycVerifiedAt'] ?? record['kyc_verified_at'],
    ),
    passportVerifiedAt: asNullableString(
      record['passportVerifiedAt'] ?? record['passport_verified_at'],
    ),
    suspendedAt: asNullableString(
      record['suspendedAt'] ?? record['suspended_at'],
    ),
    deactivatedAt: asNullableString(
      record['deactivatedAt'] ?? record['deactivated_at'],
    ),
    active: Boolean(record['active']),
    defaultPassword: Boolean(
      record['defaultPassword'] ?? record['default_password'],
    ),
    type: String(record['type'] ?? ''),
    deletedAt: asNullableString(
      record['deletedAt'] ?? record['deleted_at'],
    ),
    createdAt: asNullableString(
      record['createdAt'] ?? record['created_at'],
    ),
    updatedAt: asNullableString(
      record['updatedAt'] ?? record['updated_at'],
    ),
    lastLoginAt: asNullableString(
      record['lastLoginAt'] ?? record['last_login_at'],
    ),
    socialiteSignup: asFlag01(
      record['socialiteSignup'] ?? record['socialite_signup'],
    ),
    formSignup: asFlag01(record['formSignup'] ?? record['form_signup']),
    mainRegion: String(record['mainRegion'] ?? record['main_region'] ?? ''),
    shippingType: String(
      record['shippingType'] ?? record['shipping_type'] ?? '',
    ),
    accounts: mapApiJsonList(record['accounts']),
    businessAccount: mapApiJsonValue(
      record['businessAccount'] ?? record['business_account'],
    ),
    accountManager: mapApiJsonValue(
      record['accountManager'] ?? record['account_manager'],
    ),
  };
}
