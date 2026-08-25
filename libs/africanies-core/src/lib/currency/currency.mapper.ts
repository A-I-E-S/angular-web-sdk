import type {
  CurrencyCreateRequestModel,
  CurrencyDeleteRequestModel,
  CurrencyFlag01,
  CurrencyModel,
  CurrencyPaymentMethodModel,
  CurrencyPaymentMethodPivotModel,
  CurrencyUpdateRequestModel,
} from '@africanies/africanies-models';

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

/** Currency read base path (relative to {@link AfricaniesSdkConfig.baseUrl}). */
export const CURRENCY_READ_PATH = '/currency/read';

/** Create path (App Settings → Currencies). */
export const CURRENCY_CREATE_PATH = '/currency/create';

/** Update path — name / short_code are not sent. */
export const CURRENCY_UPDATE_PATH = '/currency/update';

/** Delete path — JSON body `{ id }`. */
export const CURRENCY_DELETE_PATH = '/currency/delete';

/**
 * Serialize a boolean / `"1"` / `"0"` flag for currency create/update.
 * @param value - Host boolean or wire flag.
 * @returns `"1"` or `"0"`.
 */
export function toCurrencyFlag01(
  value: boolean | CurrencyFlag01 | number | null | undefined,
): CurrencyFlag01 {
  return toFlag01(value);
}

/**
 * Map a currency ↔ payment-method pivot (snake_case preserved).
 * @param raw - Pivot object from the wire.
 * @returns Normalized {@link CurrencyPaymentMethodPivotModel}.
 */
export function mapCurrencyPaymentMethodPivot(
  raw: unknown,
): CurrencyPaymentMethodPivotModel {
  const record = asRecord(raw) ?? {};
  return {
    currency_id: asNumber(record['currency_id'] ?? record['currencyId']),
    payment_method_id: asNumber(
      record['payment_method_id'] ?? record['paymentMethodId'],
    ),
  };
}

/**
 * Map a wire payment method into {@link CurrencyPaymentMethodModel}.
 * @param raw - Payment-method object from the wire.
 * @returns Normalized {@link CurrencyPaymentMethodModel}.
 */
export function mapCurrencyPaymentMethod(
  raw: unknown,
): CurrencyPaymentMethodModel {
  const record = asRecord(raw) ?? {};
  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    model: asString(record['model']),
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    pivot: mapCurrencyPaymentMethodPivot(record['pivot']),
  };
}

/**
 * Map a wire currency into {@link CurrencyModel} (snake_case preserved).
 * @param raw - Currency object from the API.
 * @returns Normalized {@link CurrencyModel}.
 */
export function mapCurrency(raw: unknown): CurrencyModel {
  const record = asRecord(raw) ?? {};
  const payment_methods = mapArray(
    record['payment_methods'] ?? record['paymentMethods'],
    mapCurrencyPaymentMethod,
  );
  const nairaGreater = asBoolean(
    record['is_naira_greater'] ??
      record['isNairaGreater'] ??
      record['is_local_currency_greater'] ??
      record['isLocalCurrencyGreater'],
  );

  return {
    id: asNumber(record['id']),
    name: asString(record['name']),
    short_code: asString(record['short_code'] ?? record['shortCode']),
    division_rate: asString(record['division_rate'] ?? record['divisionRate']),
    multiplication_rate: asString(
      record['multiplication_rate'] ?? record['multiplicationRate'],
    ),
    is_local_currency_greater: nairaGreater,
    is_naira_greater: nairaGreater,
    active: asBoolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    payment_methods,
  };
}

/**
 * Map a list (or single object) payload into {@link CurrencyModel}[].
 *
 * @param raw - `data` payload from `/currency/read/{id|all}`.
 * @returns Mapped currency list (empty when `raw` is null/undefined).
 */
export function mapCurrencyList(raw: unknown): CurrencyModel[] {
  return mapList(raw, mapCurrency);
}

function paymentMethodIds(raw: unknown): number[] {
  return mapArray(raw, (entry) => asNumber(entry));
}

/**
 * Wire body for `POST /currency/create`.
 * @param body - Host create payload.
 * @returns JSON body with `"1"` / `"0"` flags.
 */
export function toCurrencyCreateBody(
  body: CurrencyCreateRequestModel | null | undefined,
): {
  name: string;
  short_code: string;
  multiplication_rate: string;
  division_rate: string;
  active: CurrencyFlag01;
  is_naira_greater: CurrencyFlag01;
  payment_method_ids: number[];
} {
  return {
    name: asString(body?.name).trim(),
    short_code: asString(body?.short_code).trim(),
    multiplication_rate: asString(body?.multiplication_rate),
    division_rate: asString(body?.division_rate),
    active: toCurrencyFlag01(body?.active),
    is_naira_greater: toCurrencyFlag01(body?.is_naira_greater),
    payment_method_ids: paymentMethodIds(body?.payment_method_ids),
  };
}

/**
 * Wire body for `PUT /currency/update` (no name / short_code).
 * @param body - Host update payload.
 * @returns JSON body with `"1"` / `"0"` flags.
 */
export function toCurrencyUpdateBody(
  body: CurrencyUpdateRequestModel | null | undefined,
): {
  id: number;
  multiplication_rate: string;
  division_rate: string;
  active: CurrencyFlag01;
  is_naira_greater: CurrencyFlag01;
  payment_method_ids: number[];
} {
  return {
    id: asNumber(body?.id),
    multiplication_rate: asString(body?.multiplication_rate),
    division_rate: asString(body?.division_rate),
    active: toCurrencyFlag01(body?.active),
    is_naira_greater: toCurrencyFlag01(body?.is_naira_greater),
    payment_method_ids: paymentMethodIds(body?.payment_method_ids),
  };
}

/**
 * Wire body for `DELETE /currency/delete`.
 * @param body - Currency id wrapper.
 * @returns `{ id }`.
 */
export function toCurrencyDeleteBody(
  body: CurrencyDeleteRequestModel | number | null | undefined,
): { id: number } {
  if (typeof body === 'number') {
    return { id: asNumber(body) };
  }
  return { id: asNumber(body?.id) };
}
