import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import type { GooglePlacesConfig } from './address-input.types';
import { GOOGLE_PLACES_CONFIG } from './google-places.token';

/**
 * Registers Places API (New) for {@link AddressInputComponent}.
 *
 * Provide once at bootstrap. Requires an API key with Places API (New)
 * enabled (REST `places.googleapis.com`, not the Maps JavaScript widget).
 *
 * @param config - API key and optional language / region.
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * import { provideGooglePlaces } from '@africanies/africanies-ui';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideGooglePlaces({ apiKey: import.meta.env['NG_APP_GOOGLE_MAPS_KEY'] }),
 *   ],
 * };
 * ```
 */
export function provideGooglePlaces(
  config: GooglePlacesConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: GOOGLE_PLACES_CONFIG, useValue: config },
  ]);
}
