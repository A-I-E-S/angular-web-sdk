import type { IconName } from '@africanies/africanies-icons';

import type { HeaderWeather, HeaderWeatherKind } from './header-greeting.util';

/** Bump when cache shape or city resolution strategy changes. */
const CACHE_KEY = 'africanies-header-weather-v4';
const FETCH_MS = 4_000;
const BROWSER_GEO_MS = 3_500;
/** IP fallback — city string is often wrong (e.g. NG IPs labelled Lagos). */
const GEO_URL = 'https://get.geojs.io/v1/ip/geo.json';
/** Client reverse-geocode so the label matches the forecast coordinates. */
const REVERSE_GEO_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

const WEATHER_LABELS: Record<HeaderWeatherKind, string> = {
  clear: 'Clear',
  cloudy: 'Cloudy',
  fog: 'Fog',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Storm',
};

interface CachedWeather {
  hour: string;
  kind: HeaderWeatherKind;
  temperatureC?: number;
  city?: string;
}

interface GeoJsPayload {
  city?: string;
  latitude?: string | number;
  longitude?: string | number;
}

interface ReverseGeoPayload {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
}

interface OpenMeteoPayload {
  current?: {
    weather_code?: number;
    temperature_2m?: number;
  };
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Map Open-Meteo / WMO weather codes to a greeting flavor.
 *
 * @param code - WMO weather interpretation code.
 * @returns Coarse kind, or `null` when the code is unknown.
 */
export function mapWmoWeatherCode(code: number): HeaderWeatherKind | null {
  if (code === 0 || code === 1) {
    return 'clear';
  }
  if (code === 2 || code === 3) {
    return 'cloudy';
  }
  if (code === 45 || code === 48) {
    return 'fog';
  }
  if (code >= 51 && code <= 57) {
    return 'drizzle';
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return 'rain';
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return 'snow';
  }
  if (code === 95 || code === 96 || code === 99) {
    return 'storm';
  }
  return null;
}

/**
 * Short condition label for the header weather chip.
 *
 * @param kind - Coarse forecast kind.
 * @returns Display label such as `Rain` or `Clear`.
 */
export function headerWeatherLabel(kind: HeaderWeatherKind): string {
  return WEATHER_LABELS[kind];
}

/**
 * Icon for the header weather chip.
 *
 * @param kind - Coarse forecast kind.
 * @param hour - Local hour, used to pick sun vs moon when it is clear.
 * @returns Icon name from the product sprite.
 */
export function headerWeatherIcon(kind: HeaderWeatherKind, hour: number): IconName {
  if (kind === 'clear') {
    return hour >= 19 || hour < 6 ? 'moon-o' : 'sun-o';
  }
  if (kind === 'rain' || kind === 'drizzle' || kind === 'storm') {
    return 'cloud';
  }
  return 'cloud-o';
}

/**
 * City-level forecast via browser / IP geolocation + Open-Meteo (no API key).
 *
 * Coordinates prefer the browser Geolocation API (accurate for travellers;
 * may prompt once). Otherwise IP geo is used. The city label is reverse-
 * geocoded from those coordinates — IP `city` strings are often wrong for
 * Nigeria (many networks resolve as Lagos).
 *
 * Fails closed: missing browser APIs, timeouts, and HTTP errors all return
 * `null` so the greeting can stay time-of-day only. Cached per local hour
 * in `sessionStorage`.
 *
 * @param fetchFn - Injected `fetch` for tests.
 * @returns Forecast snapshot, or `null` when lookup fails.
 */
export async function loadHeaderWeather(
  fetchFn?: typeof fetch,
): Promise<HeaderWeather | null> {
  const run = fetchFn ?? defaultFetch();
  if (typeof run !== 'function' || typeof window === 'undefined') {
    return null;
  }

  const hour = calendarHourKey();
  const cached = readCache(hour);
  if (cached) {
    return cached;
  }

  try {
    const coords = await resolveCoordinates(run);
    if (!coords) {
      return null;
    }

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${coords.latitude}&longitude=${coords.longitude}` +
      `&current=weather_code,temperature_2m`;
    const forecast = (await fetchJson(run, forecastUrl)) as OpenMeteoPayload | null;
    const code = asNumber(forecast?.current?.weather_code);
    if (code === null) {
      return null;
    }

    const kind = mapWmoWeatherCode(code);
    if (!kind) {
      return null;
    }

    const temperatureC = asNumber(forecast?.current?.temperature_2m) ?? undefined;
    const city =
      (await reverseGeocodeCity(run, coords.latitude, coords.longitude)) ??
      coords.fallbackCity;
    const weather: HeaderWeather = { kind, temperatureC, city };
    writeCache({ hour, kind, temperatureC, city });
    return weather;
  } catch {
    return null;
  }
}

function defaultFetch(): typeof fetch | undefined {
  return typeof fetch === 'function' ? fetch.bind(globalThis) : undefined;
}

function calendarHourKey(now = new Date()): string {
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
}

function readCache(hour: string): HeaderWeather | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CachedWeather;
    if (parsed.hour !== hour || !parsed.kind) {
      return null;
    }
    return {
      kind: parsed.kind,
      temperatureC: parsed.temperatureC,
      city: parsed.city,
    };
  } catch {
    return null;
  }
}

function writeCache(value: CachedWeather): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Private mode / quota — greeting still works without cache.
  }
}

/**
 * Prefer device coordinates when available (may prompt once); otherwise fall
 * back to IP geo. IP city labels for Nigeria are often wrong — reverse
 * geocoding from these coordinates still depends on accurate lat/lon.
 */
async function resolveCoordinates(
  fetchFn: typeof fetch,
): Promise<(Coordinates & { fallbackCity?: string }) | null> {
  const browser = await tryBrowserGeolocation();
  if (browser) {
    return browser;
  }

  const geo = (await fetchJson(fetchFn, GEO_URL)) as GeoJsPayload | null;
  const latitude = asNumber(geo?.latitude);
  const longitude = asNumber(geo?.longitude);
  if (latitude === null || longitude === null) {
    return null;
  }
  return {
    latitude,
    longitude,
    fallbackCity: asCity(geo?.city),
  };
}

async function tryBrowserGeolocation(): Promise<Coordinates | null> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.geolocation?.getCurrentPosition !== 'function'
  ) {
    return null;
  }

  return await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), BROWSER_GEO_MS);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 600_000,
        timeout: BROWSER_GEO_MS,
      },
    );
  });
}

async function reverseGeocodeCity(
  fetchFn: typeof fetch,
  latitude: number,
  longitude: number,
): Promise<string | undefined> {
  const url =
    `${REVERSE_GEO_URL}?latitude=${encodeURIComponent(String(latitude))}` +
    `&longitude=${encodeURIComponent(String(longitude))}` +
    `&localityLanguage=en`;
  const payload = (await fetchJson(fetchFn, url)) as ReverseGeoPayload | null;
  return (
    asCity(payload?.city) ??
    asCity(payload?.locality) ??
    asCity(payload?.principalSubdivision)
  );
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asCity(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'n/a') {
    return undefined;
  }
  return trimmed;
}

async function fetchJson(
  fetchFn: typeof fetch,
  url: string,
): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
  try {
    const response = await fetchFn(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
