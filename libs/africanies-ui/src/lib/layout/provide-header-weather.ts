import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';

import {
  HEADER_WEATHER_CONFIG,
  type HeaderWeatherConfig,
} from './header-weather.token';

/**
 * Registers BigDataCloud (or other) options for the app-shell weather chip.
 *
 * Provide once at bootstrap. Without a key, reverse-geocode falls back to
 * Open-Meteo (no key required).
 *
 * @param config - Optional BigDataCloud API key.
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * import { provideHeaderWeather } from '@africanies/africanies-ui';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHeaderWeather({ bigDataCloudApiKey: NG_APP_BIGDATACLOUD_API_KEY }),
 *   ],
 * };
 * ```
 */
export function provideHeaderWeather(
  config: HeaderWeatherConfig,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: HEADER_WEATHER_CONFIG, useValue: config },
  ]);
}
