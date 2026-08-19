import {
  headerWeatherIcon,
  headerWeatherLabel,
  loadHeaderWeather,
  mapWmoWeatherCode,
} from './header-weather';

describe('mapWmoWeatherCode', () => {
  it('maps common WMO codes', () => {
    expect(mapWmoWeatherCode(0)).toBe('clear');
    expect(mapWmoWeatherCode(3)).toBe('cloudy');
    expect(mapWmoWeatherCode(45)).toBe('fog');
    expect(mapWmoWeatherCode(51)).toBe('drizzle');
    expect(mapWmoWeatherCode(61)).toBe('rain');
    expect(mapWmoWeatherCode(80)).toBe('rain');
    expect(mapWmoWeatherCode(71)).toBe('snow');
    expect(mapWmoWeatherCode(95)).toBe('storm');
  });

  it('returns null for unknown codes', () => {
    expect(mapWmoWeatherCode(999)).toBeNull();
  });
});

describe('loadHeaderWeather', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    sessionStorage.clear();
  });

  it('returns null when geolocation fails', async () => {
    const fetchFn = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    }));

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toBeNull();
  });

  it('reads Open-Meteo after IP geolocation', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: '6.45', longitude: '3.39', city: 'Lagos' });
      }
      return jsonResponse({
        current: { weather_code: 61, temperature_2m: 27.4 },
      });
    });

    await expect(loadHeaderWeather(fetchFn as unknown as typeof fetch)).resolves.toEqual({
      kind: 'rain',
      temperatureC: 27.4,
      city: 'Lagos',
    });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('reuses the same-day session cache', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: 1, longitude: 2 });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30 } });
    });

    const first = await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    const second = await loadHeaderWeather(fetchFn as unknown as typeof fetch);

    expect(first).toEqual(second);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

describe('headerWeatherLabel', () => {
  it('returns a short condition', () => {
    expect(headerWeatherLabel('rain')).toBe('Rain');
    expect(headerWeatherLabel('clear')).toBe('Clear');
  });
});

describe('headerWeatherIcon', () => {
  it('uses sun by day and moon at night when clear', () => {
    expect(headerWeatherIcon('clear', 10)).toBe('sun-o');
    expect(headerWeatherIcon('clear', 22)).toBe('moon-o');
  });

  it('uses cloud marks for wet weather', () => {
    expect(headerWeatherIcon('rain', 10)).toBe('cloud');
    expect(headerWeatherIcon('cloudy', 10)).toBe('cloud-o');
  });
});

function jsonResponse(body: unknown): Pick<Response, 'ok' | 'json'> {
  return {
    ok: true,
    json: async () => body,
  };
}
