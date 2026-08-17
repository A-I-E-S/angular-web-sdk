import { TestBed } from '@angular/core/testing';

import { GooglePlacesService } from './google-places.service';
import { GOOGLE_PLACES_CONFIG } from './google-places.token';

describe('GooglePlacesService (Places API New REST)', () => {
  let service: GooglePlacesService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    if (typeof globalThis.fetch !== 'function') {
      globalThis.fetch = jest.fn() as typeof fetch;
    }
    fetchMock = jest.spyOn(globalThis, 'fetch');
    TestBed.configureTestingModule({
      providers: [
        GooglePlacesService,
        {
          provide: GOOGLE_PLACES_CONFIG,
          useValue: { apiKey: 'test-key' },
        },
      ],
    });
    service = TestBed.inject(GooglePlacesService);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('returns [] when the query or key is empty without calling fetch', async () => {
    await expect(service.getPredictions('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs autocomplete and maps structured suggestions', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        suggestions: [
          {
            placePrediction: {
              placeId: 'ChIJ123',
              text: { text: '12 Broad Street, Lagos, Nigeria' },
              structuredFormat: {
                mainText: { text: '12 Broad Street' },
                secondaryText: { text: 'Lagos, Nigeria' },
              },
            },
          },
        ],
      }),
    );

    await expect(service.getPredictions('12 Broad')).resolves.toEqual([
      {
        placeId: 'ChIJ123',
        description: '12 Broad Street, Lagos, Nigeria',
        mainText: '12 Broad Street',
        secondaryText: 'Lagos, Nigeria',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://places.googleapis.com/v1/places:autocomplete');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['X-Goog-Api-Key']).toBe(
      'test-key',
    );
    expect(JSON.parse(String(init.body))).toEqual({ input: '12 Broad' });
  });

  it('throws a Places API error message when autocomplete is denied', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { message: 'Places API (New) is not enabled.' } },
        403,
      ),
    );

    await expect(service.getPredictions('12 Broad')).rejects.toThrow(
      'Places API (New) is not enabled.',
    );
  });

  it('GETs place details and maps lat/lng plus address parts', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 'ChIJ123',
        formattedAddress: '12 Broad Street, Lagos, Nigeria',
        location: { latitude: 6.4541, longitude: 3.3947 },
        addressComponents: [
          { longText: '12', shortText: '12', types: ['street_number'] },
          { longText: 'Broad Street', shortText: 'Broad St', types: ['route'] },
          { longText: 'Lagos', shortText: 'Lagos', types: ['locality'] },
          {
            longText: 'Lagos',
            shortText: 'LA',
            types: ['administrative_area_level_1'],
          },
          { longText: 'Nigeria', shortText: 'NG', types: ['country'] },
        ],
      }),
    );

    await expect(service.getPlaceDetails('places/ChIJ123')).resolves.toEqual({
      placeId: 'ChIJ123',
      formattedAddress: '12 Broad Street, Lagos, Nigeria',
      lat: 6.4541,
      lng: 3.3947,
      streetNumber: '12',
      route: 'Broad Street',
      locality: 'Lagos',
      administrativeAreaLevel1: 'Lagos',
      administrativeAreaLevel1Code: 'LA',
      country: 'Nigeria',
      countryCode: 'NG',
      postalCode: undefined,
      addressComponents: expect.any(Array),
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://places.googleapis.com/v1/places/ChIJ123');
    expect(init.method).toBe('GET');
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}
