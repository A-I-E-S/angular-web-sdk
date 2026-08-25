import type { ShippingMode } from '@africanies/africanies-models';

import { asString } from '../http/wire';

const SHIPMENT_APP_BY_MODE: Record<ShippingMode, string> = {
  stn: 'shiptonaija',
  sfn: 'shipfromnaija',
};

/**
 * Rewrite a notification portal URL for the active {@link ShippingMode}.
 *
 * Swaps `-export` / `-import` host segments and sets `shipment_app` to
 * `shipfromnaija` (SFN) or `shiptonaija` (STN).
 * @param link
 * @param mode
 */
export function resolveNotificationLinkForMode(
  link: string | null | undefined,
  mode: ShippingMode,
): string {
  const trimmed = asString(link).trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    url.searchParams.set('shipment_app', SHIPMENT_APP_BY_MODE[mode]);
    url.hostname = rewriteNotificationHostForMode(url.hostname, mode);
    return url.toString();
  } catch {
    return rewriteNotificationLinkFallback(trimmed, mode);
  }
}

function rewriteNotificationHostForMode(
  hostname: string,
  mode: ShippingMode,
): string {
  if (mode === 'stn') {
    return hostname.replace(/-export/i, '-import');
  }
  return hostname.replace(/-import/i, '-export');
}

function rewriteNotificationLinkFallback(
  link: string,
  mode: ShippingMode,
): string {
  let out = link.replace(
    /shipment_app=(?:shipfromnaija|shiptonaija)/gi,
    `shipment_app=${SHIPMENT_APP_BY_MODE[mode]}`,
  );

  if (!/shipment_app=/i.test(out)) {
    const joiner = out.includes('?') ? '&' : '?';
    out = `${out}${joiner}shipment_app=${SHIPMENT_APP_BY_MODE[mode]}`;
  }

  if (mode === 'stn') {
    return out.replace(/-export/gi, '-import');
  }
  return out.replace(/-import/gi, '-export');
}
