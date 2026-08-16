import type { ApiErrorDetailModel } from '@aies/aies-models';

import { asArray, asRecord, asString } from './wire';

/**
 * Laravel-style validation bag: `{ field: ["msg", ...] }`.
 * @param value - Candidate JSON object.
 */
export function isLaravelValidationBag(value: unknown): boolean {
  const record = asRecord(value);
  if (record === null) {
    return false;
  }

  const keys = Object.keys(record);
  if (keys.length === 0) {
    return false;
  }

  return keys.every((key) => {
    const entry = record[key];
    return (
      Array.isArray(entry) &&
      entry.every((item) => typeof item === 'string')
    );
  });
}

/**
 * Flatten a validation bag into {@link ApiErrorDetailModel} rows.
 *
 * Uses messages in order; the first message per field is what
 * {@link fieldErrorsMap} exposes for form binding.
 * @param bag - Field → messages map.
 */
export function mapLaravelValidationBag(
  bag: Record<string, unknown>,
): ApiErrorDetailModel[] {
  const details: ApiErrorDetailModel[] = [];

  for (const [field, rawMessages] of Object.entries(bag)) {
    const messages = asArray<string>(rawMessages)
      .map((m) => asString(m).trim())
      .filter((m) => m.length > 0);

    for (const message of messages) {
      details.push({ field, message, code: null });
    }
  }

  return details;
}

/**
 * Join field errors for toast / banner copy (one line per message, de-duped).
 * Prefer this over top-level `message` when a bag is present — the envelope
 * `message` is often only the first field.
 * @param errors - Normalized field errors.
 */
export function joinApiErrorMessages(
  errors: ApiErrorDetailModel[] | null | undefined,
): string | null {
  if (!errors?.length) {
    return null;
  }

  const lines: string[] = [];
  const seen = new Set<string>();

  for (const detail of errors) {
    const message = detail.message.trim();
    if (!message || seen.has(message)) {
      continue;
    }
    seen.add(message);
    lines.push(message);
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

/**
 * First message per field for form control binding.
 * @param errors - Normalized field errors.
 */
export function fieldErrorsMap(
  errors: ApiErrorDetailModel[] | null | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  if (!errors?.length) {
    return map;
  }

  for (const detail of errors) {
    const field = detail.field?.trim();
    const message = detail.message.trim();
    if (!field || !message || field in map) {
      continue;
    }
    map[field] = message;
  }

  return map;
}
