/**
 * Well-known local/session storage keys used across AFRICANIES SDK packages.
 *
 * Centralizing these avoids typos between theme, shipping-mode, and
 * auth persistence layers that all go through {@link StorageService}.
 */

/** Persisted UI theme preference (`'light' | 'dark'` or equivalent). */
export const AFRICANIES_THEME_KEY = 'africanies.theme';

/** Tab-scoped shipping mode (`'stn' | 'sfn'`) — {@link SessionStorageService}. */
export const AFRICANIES_SHIPPING_MODE_KEY = 'africanies.shippingMode';

/** Cached public mode-config payload (mapped {@link ModeConfigDataModel}). */
export const AFRICANIES_MODE_CONFIG_KEY = 'africanies.modeConfig';

/** Persisted bearer access token for authenticated SDK HTTP calls. */
export const AFRICANIES_ACCESS_TOKEN_KEY = 'africanies.accessToken';
