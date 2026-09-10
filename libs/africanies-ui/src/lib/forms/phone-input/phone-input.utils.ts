import { countryFlagUrl } from '@africanies/africanies-core';

import {
  PHONE_DIAL_CODES,
  PHONE_MAX_NATIONAL_DIGITS,
  PHONE_MIN_NATIONAL_DIGITS,
} from './phone-codes';
import type { PhoneCountryOption, PhoneNumberValue } from './phone-input.types';

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

/** Digits only from a phone draft. */
export function phoneDigitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Normalize ISO2 to uppercase two letters, or `''`. */
export function normalizePhoneIso2(iso2: string | null | undefined): string {
  const code = (iso2 ?? '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : '';
}

/** Dial code for an ISO2 (with `+`), or `''` when unknown. */
export function dialCodeForIso2(iso2: string | null | undefined): string {
  const code = normalizePhoneIso2(iso2);
  return code ? (PHONE_DIAL_CODES[code] ?? '') : '';
}

/** English country name from ISO2 (falls back to the code). */
export function phoneCountryName(iso2: string): string {
  const code = normalizePhoneIso2(iso2);
  if (!code) {
    return '';
  }
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

/** All dial-code countries for the picker (sorted by name). */
export function phoneCountryOptions(): PhoneCountryOption[] {
  return Object.keys(PHONE_DIAL_CODES)
    .map((iso2) => {
      const dialCode = PHONE_DIAL_CODES[iso2]!;
      return {
        iso2,
        dialCode,
        name: phoneCountryName(iso2),
        flagUrl: countryFlagUrl(iso2, { width: 40 }),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filter dial-code countries by name, ISO2, or dial digits.
 * Digit matching is skipped when the query has no digits — otherwise
 * `''.includes('')` would keep every country for letter-only searches.
 */
export function filterPhoneCountries(
  countries: readonly PhoneCountryOption[],
  query: string,
): PhoneCountryOption[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...countries];
  }
  const qDigits = phoneDigitsOnly(q);
  return countries.filter((row) => {
    if (
      row.name.toLowerCase().includes(q) ||
      row.iso2.toLowerCase().includes(q) ||
      row.dialCode.toLowerCase().includes(q)
    ) {
      return true;
    }
    return qDigits.length > 0
      ? phoneDigitsOnly(row.dialCode).includes(qDigits)
      : false;
  });
}

/**
 * Match an E.164 / international string to the longest known dial code.
 * Prefers `hintIso2` when several countries share the same dial code (e.g. `+1`).
 */
export function matchDialCode(
  e164OrInternational: string,
  hintIso2?: string | null,
): { iso2: string; dialCode: string; nationalDigits: string } | null {
  const digits = phoneDigitsOnly(e164OrInternational);
  if (!digits) {
    return null;
  }

  const hint = normalizePhoneIso2(hintIso2);
  if (hint) {
    const hintDial = PHONE_DIAL_CODES[hint];
    if (hintDial) {
      const hintDigits = phoneDigitsOnly(hintDial);
      if (digits.startsWith(hintDigits)) {
        return {
          iso2: hint,
          dialCode: hintDial,
          nationalDigits: digits.slice(hintDigits.length),
        };
      }
    }
  }

  let best: { iso2: string; dialCode: string; nationalDigits: string } | null =
    null;
  for (const [iso2, dialCode] of Object.entries(PHONE_DIAL_CODES)) {
    const dialDigits = phoneDigitsOnly(dialCode);
    if (!digits.startsWith(dialDigits)) {
      continue;
    }
    const nationalDigits = digits.slice(dialDigits.length);
    if (
      !best ||
      dialDigits.length > phoneDigitsOnly(best.dialCode).length
    ) {
      best = { iso2, dialCode, nationalDigits };
    }
  }
  return best;
}

/**
 * Strip a leading dial code from a stored phone (classic `removeDialCode`).
 * Returns national digits for prefilling the input.
 */
export function removeDialCode(
  phone: string | null | undefined,
  hintIso2?: string | null,
): string {
  const raw = (phone ?? '').trim();
  if (!raw) {
    return '';
  }
  const matched = matchDialCode(raw, hintIso2);
  if (matched) {
    return matched.nationalDigits;
  }
  return phoneDigitsOnly(raw);
}

/** Group national digits for readable display (… + last 4). */
export function formatNationalDigits(digits: string): string {
  const clean = phoneDigitsOnly(digits).slice(0, PHONE_MAX_NATIONAL_DIGITS);
  if (!clean) {
    return '';
  }
  if (clean.length <= 4) {
    return clean;
  }
  const end = clean.slice(-4);
  const head = clean.slice(0, -4).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  return `${head} ${end}`.trim();
}

/**
 * Build the structured value (or `null` when empty).
 */
export function buildPhoneNumberValue(
  iso2: string,
  nationalDraft: string,
): PhoneNumberValue | null {
  const countryCode = normalizePhoneIso2(iso2);
  const dialCode = dialCodeForIso2(countryCode);
  if (!countryCode || !dialCode) {
    return null;
  }

  const nationalDigits = phoneDigitsOnly(nationalDraft).slice(
    0,
    PHONE_MAX_NATIONAL_DIGITS,
  );
  if (!nationalDigits) {
    return null;
  }

  const number = formatNationalDigits(nationalDigits);
  const e164Number = `${dialCode}${nationalDigits}`;
  const internationalNumber = `${dialCode} ${number}`.trim();
  // Trunk-prefix `0` for national display when digits omit it (classic ngx shape).
  const nationalNumber = nationalDigits.startsWith('0')
    ? number
    : `0${number}`;

  return {
    number,
    internationalNumber,
    nationalNumber,
    e164Number,
    countryCode,
    dialCode,
  };
}

/**
 * Canonical outbound phone string — prefer E.164 from a structured value.
 */
export function phoneToE164(
  phone: PhoneNumberValue | string | null | undefined,
): string {
  if (phone == null) {
    return '';
  }
  if (typeof phone === 'string') {
    const digits = phoneDigitsOnly(phone);
    if (!digits) {
      return '';
    }
    return phone.trim().startsWith('+') ? `+${digits}` : phone.trim();
  }
  return phone.e164Number?.trim() || '';
}

/**
 * Soft validity: has dial code + enough national digits (not full libphonenumber).
 */
export function isPhoneNumberComplete(
  phone: PhoneNumberValue | null | undefined,
): boolean {
  if (!phone?.e164Number) {
    return false;
  }
  const national = phoneDigitsOnly(phone.number);
  return (
    national.length >= PHONE_MIN_NATIONAL_DIGITS &&
    national.length <= PHONE_MAX_NATIONAL_DIGITS
  );
}

/**
 * Split an incoming control value (E.164 string or structured) into UI state.
 */
export function parsePhoneControlValue(
  value: string | PhoneNumberValue | null | undefined,
  fallbackIso2: string,
): { iso2: string; nationalDigits: string } {
  const fallback = normalizePhoneIso2(fallbackIso2) || 'US';

  if (value == null || value === '') {
    return { iso2: fallback, nationalDigits: '' };
  }

  if (typeof value === 'object') {
    const iso2 = normalizePhoneIso2(value.countryCode) || fallback;
    const national =
      phoneDigitsOnly(value.number) ||
      phoneDigitsOnly(value.nationalNumber) ||
      removeDialCode(value.e164Number, iso2);
    return { iso2, nationalDigits: national };
  }

  const matched = matchDialCode(value, fallback);
  if (matched) {
    return {
      iso2: matched.iso2,
      nationalDigits: matched.nationalDigits,
    };
  }

  return {
    iso2: fallback,
    nationalDigits: phoneDigitsOnly(value),
  };
}
