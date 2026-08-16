import type {
  PaymentMethodCurrencyModel,
  PaymentMethodFlag01,
  PaymentMethodModel,
  PaymentMethodUpdateRequestModel,
} from '@aies/aies-models';

import {
  mapCurrency,
  mapCurrencyPaymentMethodPivot,
} from '../currency/currency.mapper';
import {
  asBoolean,
  asNullableString,
  asNumber,
  asRecord,
  asString,
  mapArray,
  mapList,
  toFlag01,
} from '../http/wire';

/** Payment-method read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const PAYMENT_METHOD_READ_PATH = '/payment_method/read';

/** Payment-method update path (`PUT`). */
export const PAYMENT_METHOD_UPDATE_PATH = '/payment_method/update';

/**
 * Serialize a boolean / `"1"` / `"0"` flag for payment-method update.
 * @param value - Host boolean or wire flag.
 * @returns `"1"` or `"0"`.
 */
export function toPaymentMethodFlag01(
  value: boolean | PaymentMethodFlag01 | number | null | undefined,
): PaymentMethodFlag01 {
  return toFlag01(value);
}

/**
 * Build the wire body for `PUT /payment_method/update`.
 *
 * @param body - Host update payload (`active` may be boolean).
 * @returns Body with `active` as `"1"` / `"0"`.
 */
export function toPaymentMethodUpdateBody(
  body: PaymentMethodUpdateRequestModel,
): {
  id: number;
  name: string;
  model: string;
  active: PaymentMethodFlag01;
} {
  return {
    id: asNumber(body?.id),
    name: asString(body?.name),
    model: asString(body?.model),
    active: toPaymentMethodFlag01(body?.active),
  };
}

/**
 * Map a currency nested on a payment method (rates + pivot, no processors).
 * @param raw - Currency object from `currencies[]`.
 * @returns Normalized {@link PaymentMethodCurrencyModel}.
 */
export function mapPaymentMethodCurrency(
  raw: unknown,
): PaymentMethodCurrencyModel {
  const mapped = mapCurrency(raw);
  const record = asRecord(raw) ?? {};
  return {
    id: mapped.id,
    name: mapped.name,
    short_code: mapped.short_code,
    division_rate: mapped.division_rate,
    multiplication_rate: mapped.multiplication_rate,
    is_local_currency_greater: mapped.is_local_currency_greater,
    is_naira_greater: mapped.is_naira_greater,
    active: mapped.active,
    deleted_at: mapped.deleted_at,
    created_at: mapped.created_at,
    updated_at: mapped.updated_at,
    pivot: mapCurrencyPaymentMethodPivot(record['pivot']),
  };
}

/**
 * Map a wire payment method into {@link PaymentMethodModel}.
 * @param raw - Payment-method object from the API.
 * @returns Normalized {@link PaymentMethodModel}.
 */
export function mapPaymentMethod(raw: unknown): PaymentMethodModel {
  const record = asRecord(raw) ?? {};

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    model: asString(record['model']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    currencies: mapArray(record['currencies'], mapPaymentMethodCurrency),
  };
}

/**
 * Map a list (or single object) payload into {@link PaymentMethodModel}[].
 *
 * @param raw - `data` payload from `/payment_method/read/{id|all}`.
 * @returns Mapped payment-method list (empty when `raw` is null/undefined).
 */
export function mapPaymentMethodList(raw: unknown): PaymentMethodModel[] {
  return mapList(raw, mapPaymentMethod);
}
