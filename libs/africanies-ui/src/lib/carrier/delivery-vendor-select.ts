import {
  DELIVERY_VENDORS,
  deliveryVendorLabel,
  EXPORT_DELIVERY_VENDORS,
  isKnownDeliveryVendor,
  normalizeDeliveryVendorForForm,
} from '@africanies/africanies-models';

import type { SelectOption } from '../forms/select/select.types';

/**
 *
 * @param includeWalkIn
 */
export function deliveryVendorSelectOptions(
  includeWalkIn = false,
): SelectOption<string>[] {
  const rows = includeWalkIn ? EXPORT_DELIVERY_VENDORS : DELIVERY_VENDORS;
  return rows.map((row) => ({ value: row.id, label: row.name }));
}

/**
 *
 * @param storedValue
 * @param baseOptions
 */
export function deliveryVendorOptionsForStoredValue(
  storedValue: string,
  baseOptions: readonly SelectOption<string>[] = deliveryVendorSelectOptions(),
): SelectOption<string>[] {
  const normalized = normalizeDeliveryVendorForForm(storedValue);
  if (!normalized || isKnownDeliveryVendor(normalized)) {
    return [...baseOptions];
  }
  return [{ label: 'Others', value: normalized }, ...baseOptions];
}

/**
 *
 * @param storedValue
 * @param baseOptions
 */
export function deliveryVendorSelected(
  storedValue: string,
  baseOptions: readonly SelectOption<string>[] = deliveryVendorSelectOptions(),
): SelectOption<string> | null {
  const normalized = normalizeDeliveryVendorForForm(storedValue);
  if (!normalized) {
    return null;
  }
  const options = deliveryVendorOptionsForStoredValue(normalized, baseOptions);
  return options.find((row) => row.value === normalized) ?? null;
}
