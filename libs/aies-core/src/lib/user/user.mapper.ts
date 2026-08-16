import type {
  AccountType,
  PlanType,
  ShippingType,
  UserAccountManagerModel,
  UserBusinessAccountModel,
  UserCountryModel,
  UserGatewayPayloadModel,
  UserModel,
  UserModelType,
  UserPaymentPayloadModel,
  UserPlanModel,
  UserPlanPackageModel,
  UserStateModel,
  UserSubscriptionModel,
} from '@aies/aies-models';

import {
  asNullableBoolean,
  asNullableFlag01,
  asNullableNumber,
  asNullableString,
  asRecord,
  mapArray,
} from '../http/wire';

/** Current-user path (relative to {@link AiesSdkConfig.baseUrl}). */
export const USER_PATH = '/user';

/** Change-password path after a default-password first login. */
export const USER_CHANGE_PASSWORD_PATH = '/user/change/password';

/** Invalidate every session for the signed-in user. */
export const USER_LOGOUT_FROM_ALL_SESSIONS_PATH =
  '/user/logout-from-all-sessions';

const ACCOUNT_TYPES = new Set<AccountType>(['business', 'individual']);
const SHIPPING_TYPES = new Set<ShippingType>(['instant', 'consolidation']);
const PLAN_TYPES = new Set<PlanType>([
  'monthly',
  'quarterly',
  'biannually',
  'annually',
]);
const USER_MODEL_TYPES = new Set<UserModelType>([
  'App\\Models\\Customer',
  'App\\Models\\Admin',
]);

/**
 * @param value - Candidate union member.
 * @param allowed - Allowed set.
 * @returns Value when allowed; otherwise `null`.
 */
function asEnumMember<T extends string>(
  value: unknown,
  allowed: Set<T>,
): T | null {
  if (typeof value !== 'string') {
    return null;
  }
  return allowed.has(value as T) ? (value as T) : null;
}

/**
 * Map a state row under country.states.
 * @param raw - State object from the wire.
 * @returns {@link UserStateModel}, or `null`.
 */
export function mapUserCountryState(raw: unknown): UserStateModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    name: asNullableString(record['name']),
    state_code: asNullableString(
      record['state_code'] ?? record['stateCode'],
    ),
  };
}

/**
 * Map nested country on the user profile.
 * @param raw - Country object from the wire.
 * @returns {@link UserCountryModel}, or `null`.
 */
export function mapUserCountry(raw: unknown): UserCountryModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  const states = Array.isArray(record['states'])
    ? mapArray(record['states'], mapUserCountryState).filter(
        (entry): entry is UserStateModel => entry !== null,
      )
    : null;

  return {
    id: asNullableNumber(record['id']),
    name: asNullableString(record['name']),
    iso3: asNullableString(record['iso3']),
    iso2: asNullableString(record['iso2']),
    states,
  };
}

/**
 * Normalize `state` when the API returns a string (or an object with `name`).
 * @param raw - Wire `state` field.
 * @returns String label, or `null`.
 */
export function mapUserStateLabel(raw: unknown): string | null {
  if (raw == null) {
    return null;
  }
  if (typeof raw === 'string') {
    return raw;
  }
  const record = asRecord(raw);
  if (record !== null) {
    return asNullableString(record['name'] ?? record['state']);
  }
  return null;
}

/**
 * @param raw - Plan package object.
 * @returns {@link UserPlanPackageModel}, or `null`.
 */
export function mapUserPlanPackage(raw: unknown): UserPlanPackageModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNullableNumber(record['id']),
    plan_id: asNullableNumber(record['plan_id'] ?? record['planId']),
    company_service_id: asNullableNumber(
      record['company_service_id'] ?? record['companyServiceId'],
    ),
    name: asNullableString(record['name']),
    metrics: asNullableString(record['metrics']),
    volume: asNullableNumber(record['volume']),
    discount: asNullableString(record['discount']),
    model: asNullableString(record['model']),
    monthly: asNullableString(record['monthly']),
    quarterly: asNullableString(record['quarterly']),
    biannually: asNullableString(record['biannually']),
    annually: asNullableString(record['annually']),
    active: asNullableBoolean(record['active']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
  };
}

/**
 * @param raw - Plan object.
 * @returns {@link UserPlanModel}, or `null`.
 */
export function mapUserPlan(raw: unknown): UserPlanModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  const packages = Array.isArray(record['packages'])
    ? mapArray(record['packages'], mapUserPlanPackage).filter(
        (entry): entry is UserPlanPackageModel => entry !== null,
      )
    : null;

  return {
    id: asNullableNumber(record['id']),
    name: asNullableString(record['name']),
    active: asNullableBoolean(record['active']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
    packages,
  };
}

/**
 * @param raw - Gateway payload object.
 * @returns {@link UserGatewayPayloadModel}, or `null`.
 */
export function mapUserGatewayPayload(
  raw: unknown,
): UserGatewayPayloadModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    authorization_url: asNullableString(
      record['authorization_url'] ?? record['authorizationUrl'],
    ),
    access_code: asNullableString(
      record['access_code'] ?? record['accessCode'],
    ),
    reference: asNullableString(record['reference']),
    redirect_url: asNullableString(
      record['redirect_url'] ?? record['redirectUrl'],
    ),
  };
}

/**
 * @param raw - Payment payload object (already parsed).
 * @returns {@link UserPaymentPayloadModel}, or `null`.
 */
export function mapUserPaymentPayload(
  raw: unknown,
): UserPaymentPayloadModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    url: asNullableString(record['url']),
    redirect_url: asNullableString(
      record['redirect_url'] ?? record['redirectUrl'],
    ),
    gateway_payload: mapUserGatewayPayload(
      record['gateway_payload'] ?? record['gatewayPayload'],
    ),
    reference: asNullableString(record['reference']),
  };
}

/**
 * @param raw - Subscription object.
 * @returns {@link UserSubscriptionModel}, or `null`.
 */
export function mapUserSubscription(
  raw: unknown,
): UserSubscriptionModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNullableNumber(record['id']),
    user_id: asNullableNumber(record['user_id'] ?? record['userId']),
    plan_id: asNullableNumber(record['plan_id'] ?? record['planId']),
    account_id: asNullableNumber(record['account_id'] ?? record['accountId']),
    reference: asNullableString(record['reference']),
    process_url: asNullableString(
      record['process_url'] ?? record['processUrl'],
    ),
    reference_salt: asNullableString(
      record['reference_salt'] ?? record['referenceSalt'],
    ),
    amount: asNullableString(record['amount']),
    currency: asNullableString(record['currency']),
    payment_amount: asNullableString(
      record['payment_amount'] ?? record['paymentAmount'],
    ),
    payment_currency: asNullableString(
      record['payment_currency'] ?? record['paymentCurrency'],
    ),
    coupon_id: asNullableNumber(record['coupon_id'] ?? record['couponId']),
    coupon_discount: asNullableString(
      record['coupon_discount'] ?? record['couponDiscount'],
    ),
    coupon_amount: asNullableString(
      record['coupon_amount'] ?? record['couponAmount'],
    ),
    payment_payload: asNullableString(
      record['payment_payload'] ?? record['paymentPayload'],
    ),
    plan_type: asEnumMember(
      record['plan_type'] ?? record['planType'],
      PLAN_TYPES,
    ),
    used: asNullableBoolean(record['used']),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
  };
}

/**
 * @param raw - Business account object.
 * @returns {@link UserBusinessAccountModel}, or `null`.
 */
export function mapUserBusinessAccount(
  raw: unknown,
): UserBusinessAccountModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNullableNumber(record['id']),
    user_id: asNullableNumber(record['user_id'] ?? record['userId']),
    plan_id: asNullableNumber(record['plan_id'] ?? record['planId']),
    name: asNullableString(record['name']),
    account_email: asNullableString(
      record['account_email'] ?? record['accountEmail'],
    ),
    plan_type: asEnumMember(
      record['plan_type'] ?? record['planType'],
      PLAN_TYPES,
    ),
    first_payment: asNullableBoolean(
      record['first_payment'] ?? record['firstPayment'],
    ),
    is_whitelisted: asNullableBoolean(
      record['is_whitelisted'] ?? record['isWhitelisted'],
    ),
    no_state_validation: asNullableBoolean(
      record['no_state_validation'] ?? record['noStateValidation'],
    ),
    show_waybill: asNullableBoolean(
      record['show_waybill'] ?? record['showWaybill'],
    ),
    notify_api_shipment: asNullableBoolean(
      record['notify_api_shipment'] ?? record['notifyApiShipment'],
    ),
    active: asNullableBoolean(record['active']),
    expires_at: asNullableString(
      record['expires_at'] ?? record['expiresAt'],
    ),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
    type: asEnumMember(record['type'], ACCOUNT_TYPES),
    days_left: asNullableNumber(record['days_left'] ?? record['daysLeft']),
    plan: mapUserPlan(record['plan']),
    subscription: mapUserSubscription(record['subscription']),
  };
}

/**
 * @param raw - Account manager object.
 * @returns {@link UserAccountManagerModel}, or `null`.
 */
export function mapUserAccountManager(
  raw: unknown,
): UserAccountManagerModel | null {
  const record = asRecord(raw);
  if (record === null) {
    return null;
  }
  return {
    id: asNullableNumber(record['id']),
    user_id: asNullableNumber(record['user_id'] ?? record['userId']),
    manager_id: asNullableNumber(record['manager_id'] ?? record['managerId']),
    account_id: asNullableNumber(record['account_id'] ?? record['accountId']),
    name: asNullableString(record['name']),
    email: asNullableString(record['email']),
    phone: asNullableString(record['phone']),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
  };
}

/**
 * Map a bare wire user object into {@link UserModel} (snake_case preserved).
 * @param raw - User object from `GET /user` (unwrapped).
 * @returns Normalized {@link UserModel}.
 */
export function mapUser(raw: unknown): UserModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNullableNumber(record['id']),
    central_id: asNullableString(
      record['central_id'] ?? record['centralId'],
    ),
    name: asNullableString(record['name']),
    first_name: asNullableString(
      record['first_name'] ?? record['firstName'],
    ),
    middle_name: asNullableString(
      record['middle_name'] ?? record['middleName'],
    ),
    last_name: asNullableString(
      record['last_name'] ?? record['lastName'],
    ),
    email: asNullableString(record['email']),
    phone: asNullableString(record['phone']),
    unit_number: asNullableString(
      record['unit_number'] ?? record['unitNumber'],
    ),
    referral_code: asNullableString(
      record['referral_code'] ?? record['referralCode'],
    ),
    old_unit_number: asNullableString(
      record['old_unit_number'] ?? record['oldUnitNumber'],
    ),
    account_email: asNullableString(
      record['account_email'] ?? record['accountEmail'],
    ),
    two_factor: asNullableBoolean(
      record['two_factor'] ?? record['twoFactor'],
    ),
    default_pin: asNullableBoolean(
      record['default_pin'] ?? record['defaultPin'],
    ),
    model: asEnumMember(
      record['model'],
      USER_MODEL_TYPES,
    ),
    country: mapUserCountry(record['country']),
    state: mapUserStateLabel(record['state']),
    email_verified_at: asNullableString(
      record['email_verified_at'] ?? record['emailVerifiedAt'],
    ),
    phone_verified_at: asNullableString(
      record['phone_verified_at'] ?? record['phoneVerifiedAt'],
    ),
    kyc_verified_at: asNullableString(
      record['kyc_verified_at'] ?? record['kycVerifiedAt'],
    ),
    passport_verified_at: asNullableString(
      record['passport_verified_at'] ?? record['passportVerifiedAt'],
    ),
    suspended_at: asNullableString(
      record['suspended_at'] ?? record['suspendedAt'],
    ),
    deactivated_at: asNullableString(
      record['deactivated_at'] ?? record['deactivatedAt'],
    ),
    active: asNullableBoolean(record['active']),
    default_password: asNullableBoolean(
      record['default_password'] ?? record['defaultPassword'],
    ),
    type: asEnumMember(record['type'], ACCOUNT_TYPES),
    deleted_at: asNullableString(
      record['deleted_at'] ?? record['deletedAt'],
    ),
    created_at: asNullableString(
      record['created_at'] ?? record['createdAt'],
    ),
    updated_at: asNullableString(
      record['updated_at'] ?? record['updatedAt'],
    ),
    last_login_at: asNullableString(
      record['last_login_at'] ?? record['lastLoginAt'],
    ),
    socialite_signup: asNullableFlag01(
      record['socialite_signup'] ?? record['socialiteSignup'],
    ),
    form_signup: asNullableFlag01(
      record['form_signup'] ?? record['formSignup'],
    ),
    main_region: asNullableString(
      record['main_region'] ?? record['mainRegion'],
    ),
    shipping_type: asEnumMember(
      record['shipping_type'] ?? record['shippingType'],
      SHIPPING_TYPES,
    ),
    accounts: Array.isArray(record['accounts']) ? record['accounts'] : null,
    business_account: mapUserBusinessAccount(
      record['business_account'] ?? record['businessAccount'],
    ),
    account_manager: mapUserAccountManager(
      record['account_manager'] ?? record['accountManager'],
    ),
  };
}
