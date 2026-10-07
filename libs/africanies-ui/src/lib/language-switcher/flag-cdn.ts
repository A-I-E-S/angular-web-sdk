/**
 * Builds a flagcdn.com PNG URL for an ISO 3166-1 alpha-2 country code.
 *
 * @see https://flagcdn.com
 */
export function flagCdnUrl(countryCode: string, width = 40): string {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
}
