/**
 * Supported UI color schemes for {@link ThemeService}.
 *
 * Kept as a closed string union so storage values and DOM class toggles stay
 * aligned — unknown persisted strings are ignored and fall back to system
 * preference / light.
 */
export type Theme = 'light' | 'dark';
