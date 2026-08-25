import { InjectionToken } from '@angular/core';

import type { GooglePlacesConfig } from './address-input.types';

/**
 * Optional Places API (New) config. When absent, {@link AddressInputComponent}
 * still renders but predictions stay empty.
 */
export const GOOGLE_PLACES_CONFIG = new InjectionToken<GooglePlacesConfig>(
  'AFRICANIES_GOOGLE_PLACES_CONFIG',
);
