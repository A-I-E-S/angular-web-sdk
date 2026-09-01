import type { ShippingMode } from '@africanies/africanies-models';

import { asString } from '../http/wire';

const SHIPMENT_APP_BY_MODE: Record<ShippingMode, string> = {
  stn: 'shiptonaija',
  sfn: 'shipfromnaija',
};

const QUERY_SHIPMENT_APP = 'shipment_app';

const LEGACY_PORTAL_HOST =
  /^(?:test-)?(?:admin|customer)-(?:export|import)\.africaniestest\.com$/i;

/** Signed export downloads and other hosts that must not be rewritten in-app. */
export function isNotificationExternalLink(link: string): boolean {
  const trimmed = decodeNotificationLink(link).trim();
  if (!trimmed) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    if (/\.(xlsx|xls|csv)(\?|$)/i.test(url.pathname)) {
      return true;
    }
    if (/\.amazonaws\.com$/i.test(url.hostname)) {
      return true;
    }
    return !isLegacyPortalHost(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Rewrite a notification href for the active {@link ShippingMode}.
 *
 * - Export / download URLs (S3, spreadsheets) pass through unchanged (no `shipment_app`).
 * - Legacy portal hosts become relative `/portal/...` paths with query preserved.
 * - When the notification already includes `shipment_app`, it is kept as-is.
 * - Otherwise classic host / `shipment_app` rewriting applies for portal URLs.
 */
export function resolveNotificationLinkForMode(
  link: string | null | undefined,
  mode: ShippingMode,
): string {
  const trimmed = decodeNotificationLink(asString(link)).trim();
  if (!trimmed) {
    return trimmed;
  }

  if (isNotificationExternalLink(trimmed)) {
    return stripShipmentAppFromLink(trimmed);
  }

  const relativePortal = toRelativePortalNotificationLink(trimmed);
  if (relativePortal && hasShipmentAppQuery(relativePortal)) {
    return relativePortal;
  }

  const relative = normalizeRelativePortalLink(trimmed);
  if (relative && hasShipmentAppQuery(relative)) {
    return relative;
  }

  try {
    const url = new URL(trimmed);
    if (url.searchParams.has(QUERY_SHIPMENT_APP)) {
      return trimmed;
    }
    url.searchParams.set(QUERY_SHIPMENT_APP, SHIPMENT_APP_BY_MODE[mode]);
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
  if (hasShipmentAppQuery(link)) {
    return link;
  }

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

function toRelativePortalNotificationLink(link: string): string | null {
  try {
    const url = new URL(link);
    if (!isLegacyPortalHost(url.hostname)) {
      return null;
    }

    let path = url.pathname.replace(/^\/+/, '');
    if (path.startsWith('ng/portal/')) {
      path = path.slice('ng/'.length);
    }
    if (!path.startsWith('portal/') && path !== 'portal') {
      return null;
    }

    const query = url.searchParams.toString();
    return `/${path}${query ? `?${query}` : ''}`;
  } catch {
    return null;
  }
}

function normalizeRelativePortalLink(link: string): string | null {
  let path = link.split('?')[0]?.split('#')[0] ?? '';
  const query = link.includes('?') ? link.slice(link.indexOf('?')) : '';
  path = path.replace(/^\/+/, '');
  if (path.startsWith('ng/portal/')) {
    path = path.slice('ng/'.length);
  }
  if (!path.startsWith('portal/') && path !== 'portal') {
    return null;
  }
  return `/${path}${query}`;
}

function stripShipmentAppFromLink(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (!url.searchParams.has(QUERY_SHIPMENT_APP)) {
      return trimmed;
    }
    url.searchParams.delete(QUERY_SHIPMENT_APP);
    return url.toString();
  } catch {
    const params = new URLSearchParams(
      trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : '',
    );
    if (!params.has(QUERY_SHIPMENT_APP)) {
      return trimmed;
    }
    params.delete(QUERY_SHIPMENT_APP);
    const query = params.toString();
    const base = trimmed.split('?')[0] ?? trimmed;
    return query ? `${base}?${query}` : base;
  }
}

function hasShipmentAppQuery(link: string): boolean {
  try {
    const query = link.includes('?') ? link.slice(link.indexOf('?') + 1) : '';
    return new URLSearchParams(query).has(QUERY_SHIPMENT_APP);
  } catch {
    return /(?:^|[?&])shipment_app=/i.test(link);
  }
}

function decodeNotificationLink(link: string): string {
  let value = (link ?? '').trim();
  if (!value.includes('%')) {
    return value;
  }
  try {
    const decoded = decodeURIComponent(value);
    if (decoded !== value) {
      value = decoded;
    }
  } catch {
    // Keep original when not valid URI encoding.
  }
  return value;
}

function isLegacyPortalHost(hostname: string): boolean {
  return LEGACY_PORTAL_HOST.test(hostname);
}
