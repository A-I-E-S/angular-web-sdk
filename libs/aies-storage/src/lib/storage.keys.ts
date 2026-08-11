/**
 * Well-known local/session storage keys used across AIES SDK packages.
 *
 * Centralizing these avoids typos between theme, shipping-mode, and future
 * auth persistence layers that all go through {@link StorageService}.
 */

/** Persisted UI theme preference (`'light' | 'dark'` or equivalent). */
export const AIES_THEME_KEY = 'aies.theme';

/** Persisted shipping mode (`'stn' | 'sfn'`). */
export const AIES_SHIPPING_MODE_KEY = 'aies.shippingMode';
