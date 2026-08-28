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
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error?: PositionErrorCallback,
        ) => {
          error?.({
            code: 1,
            message: 'denied',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        },
      },
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: originalGeolocation,
    });
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

  it('reads Open-Meteo after IP geolocation and reverse-geocodes the city', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({
          latitude: '9.0765',
          longitude: '7.3986',
          city: 'Lagos',
        });
      }
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({ city: 'Abuja', locality: 'Abuja' });
      }
      return jsonResponse({
        current: { weather_code: 61, temperature_2m: 27.4 },
      });
    });

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toEqual({
      kind: 'rain',
      temperatureC: 27.4,
      city: 'Abuja',
    });
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('falls back to the IP city when reverse geocode is empty', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: 1, longitude: 2, city: 'Lagos' });
      }
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({});
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30 } });
    });

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toEqual({
      kind: 'clear',
      temperatureC: 30,
      city: 'Lagos',
    });
  });

  it('reuses the same-hour session cache', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: 1, longitude: 2 });
      }
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({ city: 'Accra' });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30 } });
    });

    const first = await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    const second = await loadHeaderWeather(fetchFn as unknown as typeof fetch);

    expect(first).toEqual(second);
    expect(fetchFn).toHaveBeenCalledTimes(3);
  });

  it('fetches again when the cached hour no longer matches', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: 1, longitude: 2, city: 'Lagos' });
      }
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({ city: 'Lagos' });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30.2 } });
    });

    await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    const cacheKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith('africanies-header-weather'),
    );
    expect(cacheKey).toBeDefined();
    const stored = JSON.parse(sessionStorage.getItem(cacheKey!) ?? '{}') as {
      hour?: string;
    };
    stored.hour = '1999-0-1-0';
    sessionStorage.setItem(cacheKey!, JSON.stringify(stored));

    await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    expect(fetchFn).toHaveBeenCalledTimes(6);
  });

  it('uses browser coordinates when geolocation succeeds', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          success({
            coords: {
              latitude: 9.0765,
              longitude: 7.3986,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
              toJSON: () => ({}),
            },
            timestamp: Date.now(),
            toJSON: () => ({}),
          } as GeolocationPosition);
        },
      },
    });

    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({ city: 'Abuja' });
      }
      if (String(url).includes('geojs')) {
        throw new Error('should not call IP geo');
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 31 } });
    });

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toEqual({
      kind: 'clear',
      temperatureC: 31,
      city: 'Abuja',
    });
    expect(
      fetchFn.mock.calls.some((call) => String(call[0]).includes('geojs')),
    ).toBe(false);
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
