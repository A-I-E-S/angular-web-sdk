import type { IconName } from '@africanies/africanies-icons';

import type { HeaderWeather, HeaderWeatherKind } from './header-greeting.util';

/** Bump when cache shape or city resolution strategy changes. */
const CACHE_KEY = 'africanies-header-weather-v8';
const FETCH_MS = 8_000;
/** After Allow, wait for a GPS/Wi-Fi fix. A short timeout loses the prompt and falls through to IP. */
const DEVICE_GEO_MS = 15_000;
const DEVICE_GEO_PROMPT_MS = 25_000;
/** IP city is the office egress (often Lagos) and must not label the device. */
const GEO_URL = 'https://get.geojs.io/v1/ip/geo.json';
const REVERSE_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';

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
  results?: Array<{
    name?: string;
    admin1?: string;
  }>;
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
 * @param hour - Local hour; clear days show as Sunny, nights as Clear.
 * @returns Display label such as `Rain` or `Sunny`.
 */
export function headerWeatherLabel(
  kind: HeaderWeatherKind,
  hour = new Date().getHours(),
): string {
  if (kind === 'clear') {
    return hour >= 19 || hour < 6 ? 'Clear' : 'Sunny';
  }
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
 * City-level forecast. The label is the device location only.
 *
 * The Geolocation API (GPS / nearby Wi-Fi) is reverse-geocoded. IP lookup is
 * not used for the city — a shared office egress makes every colleague "Lagos".
 * If the device fix is refused, weather still loads from IP coordinates with
 * no city.
 *
 * Fails closed: missing browser APIs, timeouts, and HTTP errors all return
 * `null` so the greeting can stay time-of-day only. A snapshot with a city
 * is cached per local hour in `sessionStorage`.
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
    const device = await tryDeviceCoordinates();
    const coords = device ?? (await ipCoordinates(run));
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
    const city = device
      ? await reverseGeocodeCity(run, device.latitude, device.longitude)
      : undefined;
    const weather: HeaderWeather = { kind, temperatureC, city };
    if (city) {
      writeCache({ hour, kind, temperatureC, city });
    }
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
    // City-less entries (e.g. browser geo + failed reverse) used to stick for
    // the hour — treat them as a miss so we can recover the location label.
    const city = asCity(parsed.city);
    if (!city) {
      return null;
    }
    return {
      kind: parsed.kind,
      temperatureC: parsed.temperatureC,
      city,
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

async function ipCoordinates(fetchFn: typeof fetch): Promise<Coordinates | null> {
  const payload = (await fetchJson(fetchFn, GEO_URL)) as GeoJsPayload | null;
  const latitude = asNumber(payload?.latitude);
  const longitude = asNumber(payload?.longitude);
  if (latitude === null || longitude === null) {
    return null;
  }
  return { latitude, longitude };
}

async function tryDeviceCoordinates(): Promise<Coordinates | null> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.geolocation?.getCurrentPosition !== 'function'
  ) {
    return null;
  }

  const permission = await geolocationPermission();
  if (permission === 'denied') {
    return null;
  }

  const timeout = permission === 'granted' ? DEVICE_GEO_MS : DEVICE_GEO_PROMPT_MS;
  return await new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeout);
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
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout,
      },
    );
  });
}

async function geolocationPermission(): Promise<PermissionState | 'unknown'> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' });
    return status?.state ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

async function reverseGeocodeCity(
  fetchFn: typeof fetch,
  latitude: number,
  longitude: number,
): Promise<string | undefined> {
  const url =
    `${REVERSE_GEO_URL}?latitude=${encodeURIComponent(String(latitude))}` +
    `&longitude=${encodeURIComponent(String(longitude))}` +
    `&language=en&count=1`;
  const payload = (await fetchJson(fetchFn, url)) as ReverseGeoPayload | null;
  const place = payload?.results?.[0];
  return asCity(place?.name) ?? asCity(place?.admin1);
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
