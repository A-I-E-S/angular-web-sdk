import { InjectionToken } from '@angular/core';

/**
 * URL of the full Africanies wordmark served from the package assets folder.
 *
 * Map `node_modules/@aies/aies-ui/assets/brand/africanies-logo.png` into your
 * app assets (see package README) or override this token.
 *
 * Default is root-absolute (`/assets/…`) so Angular property bindings and
 * `fetch()` do not resolve against the current route (e.g. `/login`).
 */
export const AIES_BRAND_LOGO_URL = new InjectionToken<string>(
  'AIES_BRAND_LOGO_URL',
  {
    providedIn: 'root',
    factory: () => '/assets/aies-ui/brand/africanies-logo.png',
  },
);

/**
 * Compact globe mark for collapsed rails and other tight placements.
 *
 * Map `node_modules/@aies/aies-ui/assets/brand/africanies-logo-mini.png` into
 * your app assets or override this token. Default is root-absolute (`/assets/…`)
 * for the same route-resolution reason as {@link AIES_BRAND_LOGO_URL}.
 */
export const AIES_BRAND_LOGO_MINI_URL = new InjectionToken<string>(
  'AIES_BRAND_LOGO_MINI_URL',
  {
    providedIn: 'root',
    factory: () => '/assets/aies-ui/brand/africanies-logo-mini.png',
  },
);
