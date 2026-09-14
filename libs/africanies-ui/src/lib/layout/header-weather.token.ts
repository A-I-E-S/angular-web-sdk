import { InjectionToken } from '@angular/core';

/**
 * Optional BigDataCloud key for {@link loadHeaderWeather} reverse-geocode.
 * When absent, Open-Meteo reverse-geocode is used instead.
 */
export interface HeaderWeatherConfig {
  bigDataCloudApiKey?: string;
}

export const HEADER_WEATHER_CONFIG = new InjectionToken<HeaderWeatherConfig>(
  'AFRICANIES_HEADER_WEATHER_CONFIG',
);
