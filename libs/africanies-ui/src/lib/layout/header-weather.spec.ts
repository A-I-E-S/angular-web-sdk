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

  it('does not label the device with the IP city', async () => {
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({
          latitude: '6.45',
          longitude: '3.4',
          city: 'Lagos',
        });
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
      city: undefined,
    });
    expect(fetchFn).not.toHaveBeenCalledWith(
      expect.stringContaining('geocoding-api'),
    );
  });

  it('reuses the same-hour session cache when the device city was resolved', async () => {
    stubDeviceAt(9.0765, 7.3986);
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geocoding-api')) {
        return jsonResponse({ results: [{ name: 'Abuja' }] });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30 } });
    });

    const first = await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    const second = await loadHeaderWeather(fetchFn as unknown as typeof fetch);

    expect(first).toEqual({ kind: 'clear', temperatureC: 30, city: 'Abuja' });
    expect(second).toEqual(first);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('fetches again when the cached hour no longer matches', async () => {
    stubDeviceAt(9.0765, 7.3986);
    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geocoding-api')) {
        return jsonResponse({ results: [{ name: 'Abuja' }] });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 30.2 } });
    });

    await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    const cacheKey = Object.keys(sessionStorage).find((key) =>
      key.startsWith('africanies-header-weather'),
    );
    expect(cacheKey).toBe('africanies-header-weather-v8');
    const stored = JSON.parse(sessionStorage.getItem(cacheKey!) ?? '{}') as {
      hour?: string;
    };
    stored.hour = '1999-0-1-0';
    sessionStorage.setItem(cacheKey!, JSON.stringify(stored));

    await loadHeaderWeather(fetchFn as unknown as typeof fetch);
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });

  it('uses device coordinates and ignores the IP city', async () => {
    stubDeviceAt(9.0765, 7.3986);

    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geocoding-api')) {
        return jsonResponse({ results: [{ name: 'Abuja' }] });
      }
      if (String(url).includes('geojs')) {
        return jsonResponse({
          latitude: 6.5,
          longitude: 3.4,
          city: 'Lagos',
        });
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
    expect(fetchFn).not.toHaveBeenCalledWith(expect.stringContaining('geojs'));
  });

  it('omits the city when the device fix has no place name', async () => {
    stubDeviceAt(9.0765, 7.3986);

    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geocoding-api')) {
        return jsonResponse({ results: [{ name: '' }] });
      }
      if (String(url).includes('geojs')) {
        return jsonResponse({
          latitude: 6.5,
          longitude: 3.4,
          city: 'Lagos',
        });
      }
      return jsonResponse({ current: { weather_code: 0, temperature_2m: 31 } });
    });

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toEqual({
      kind: 'clear',
      temperatureC: 31,
      city: undefined,
    });
    expect(fetchFn).not.toHaveBeenCalledWith(expect.stringContaining('geojs'));
  });

  it('refetches when the hour cache has weather but no city', async () => {
    sessionStorage.setItem(
      'africanies-header-weather-v8',
      JSON.stringify({
        hour: `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}-${new Date().getHours()}`,
        kind: 'cloudy',
        temperatureC: 25,
      }),
    );

    const fetchFn = jest.fn(async (url: string) => {
      if (String(url).includes('geojs')) {
        return jsonResponse({ latitude: 1, longitude: 2, city: 'Lagos' });
      }
      if (String(url).includes('bigdatacloud')) {
        return jsonResponse({ city: 'Lagos' });
      }
      return jsonResponse({ current: { weather_code: 3, temperature_2m: 25 } });
    });

    await expect(
      loadHeaderWeather(fetchFn as unknown as typeof fetch),
    ).resolves.toEqual({
      kind: 'cloudy',
      temperatureC: 25,
      city: undefined,
    });
    expect(fetchFn).toHaveBeenCalled();
  });
});

describe('headerWeatherLabel', () => {
  it('returns a short condition', () => {
    expect(headerWeatherLabel('rain')).toBe('Rain');
    expect(headerWeatherLabel('cloudy')).toBe('Cloudy');
  });

  it('uses Sunny by day and Clear at night', () => {
    expect(headerWeatherLabel('clear', 10)).toBe('Sunny');
    expect(headerWeatherLabel('clear', 22)).toBe('Clear');
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

function stubDeviceAt(latitude: number, longitude: number): void {
  Object.defineProperty(navigator, 'permissions', {
    configurable: true,
    value: {
      query: async () => ({ state: 'granted' }),
    },
  });
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (success: PositionCallback) => {
        success({
          coords: {
            latitude,
            longitude,
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
}

function jsonResponse(body: unknown): Pick<Response, 'ok' | 'json'> {
  return {
    ok: true,
    json: async () => body,
  };
}
