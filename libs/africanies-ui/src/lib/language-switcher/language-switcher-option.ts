/**
 * Option row for {@link LanguageSwitcherComponent}.
 *
 * Prefer {@link flagCountryCode} (flagcdn) unless the host already has a full
 * {@link flagUrl}.
 */
export interface LanguageSwitcherOption {
  /** Stable language code (e.g. `en`, `zh`). */
  code: string;
  /** Visible label (host may localize). */
  label: string;
  /**
   * ISO 3166-1 alpha-2 country code for flagcdn.com (e.g. `gb`, `cn`).
   * Ignored when {@link flagUrl} is set.
   */
  flagCountryCode?: string;
  /** Full image URL; overrides {@link flagCountryCode}. */
  flagUrl?: string;
}
