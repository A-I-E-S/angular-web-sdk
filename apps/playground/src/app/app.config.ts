import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { provideAiesHttpClient, provideAiesSdk } from '@aies/aies-core';
import { ThemeService } from '@aies/aies-theme';
import {
  provideAiesToasts,
  provideAiesUiOverlays,
  provideGooglePlaces,
} from '@aies/aies-ui';

import { appRoutes } from './app.routes';

/** Test export API — mode config loads from GET /public/mode/config on startup. */
const PLAYGROUND_API_BASE = 'https://test-api-export.africaniestest.com/api';

/** localStorage key for a Maps JS API key (never commit a real key). */
const GOOGLE_PLACES_API_KEY_STORAGE = 'aies.googlePlacesApiKey';

/**
 * @returns Maps API key from localStorage, or empty string.
 */
function playgroundGooglePlacesApiKey(): string {
  try {
    return globalThis.localStorage?.getItem(GOOGLE_PLACES_API_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

/**
 * Playground application providers.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideAiesSdk({
      baseUrl: PLAYGROUND_API_BASE,
      httpToasts: 'errors',
    }),
    provideAiesHttpClient(),
    provideAiesUiOverlays(),
    provideAiesToasts(),
    provideGooglePlaces({ apiKey: playgroundGooglePlacesApiKey() }),
    provideAppInitializer(() => {
      // Apply stored / system theme before first paint of themed chrome.
      inject(ThemeService);
    }),
  ],
};
