import type {
  PaymentMethodCurrencyModel,
  PaymentMethodModel,
} from '@aies/aies-models';

import {
  mapCurrency,
  mapCurrencyPaymentMethodPivot,
} from '../currency/currency.mapper';

/** Payment-method read base path (relative to {@link AiesSdkConfig.baseUrl}). */
export const PAYMENT_METHOD_READ_PATH = '/payment_method/read';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
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
  const currenciesRaw = record['currencies'];
  const currencies = Array.isArray(currenciesRaw)
    ? currenciesRaw.map((entry) => mapPaymentMethodCurrency(entry))
    : [];

  return {
    id: asNumber(record['id']),
    name: String(record['name'] ?? ''),
    model: String(record['model'] ?? ''),
    active: Boolean(record['active']),
    deleted_at: asNullableString(record['deleted_at'] ?? record['deletedAt']),
    created_at: asNullableString(record['created_at'] ?? record['createdAt']),
    updated_at: asNullableString(record['updated_at'] ?? record['updatedAt']),
    currencies,
  };
}

/**
 * Map a list (or single object) payload into {@link PaymentMethodModel}[].
 *
 * @param raw - `data` payload from `/payment_method/read/{id|all}`.
 * @returns Mapped payment-method list (empty when `raw` is null/undefined).
 */
export function mapPaymentMethodList(raw: unknown): PaymentMethodModel[] {
  if (raw == null) {
    return [];
  }
  if (Array.isArray(raw)) {
    return raw.map((entry) => mapPaymentMethod(entry));
  }
  return [mapPaymentMethod(raw)];
}
