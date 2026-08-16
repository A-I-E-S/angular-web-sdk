import { asString } from '../http/wire';

/**
 * Enable forgot-password submit when the address looks like an email.
 *
 * Intentionally loose (`local@host.tld`) — the API owns uniqueness and
 * deliverability. Empty / whitespace-only values fail.
 *
 * @param value - Raw field value.
 * @returns Whether submit should be enabled.
 */
export function isValidEmail(value: unknown): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(asString(value).trim());
}
