import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import type {
  AddressComponent,
  AddressPlace,
  AddressPrediction,
} from './address-input.types';
import { GOOGLE_PLACES_CONFIG } from './google-places.token';

/** Minimal ambient shapes for the classic Places JS API. */
interface GoogleMapsWindow {
  google?: {
    maps?: {
      places?: {
        AutocompleteService: new () => GoogleAutocompleteService;
        PlacesService: new (attrContainer: HTMLDivElement) => GooglePlacesServiceApi;
        PlacesServiceStatus: {
          OK: string;
          ZERO_RESULTS: string;
        };
      };
    };
  };
}

interface GoogleAutocompleteService {
  getPlacePredictions(
    request: {
      input: string;
      componentRestrictions?: { country: string | string[] };
      types?: string[];
    },
    callback: (
      predictions: GoogleAutocompletePrediction[] | null,
      status: string,
    ) => void,
  ): void;
}

interface GoogleAutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

interface GooglePlacesServiceApi {
  getDetails(
    request: {
      placeId: string;
      fields: string[];
    },
    callback: (place: GooglePlaceResult | null, status: string) => void,
  ): void;
}

interface GooglePlaceResult {
  place_id?: string;
  formatted_address?: string;
  name?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components?: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

const SCRIPT_ID = 'aies-google-maps-places';

/**
 * Loads the Google Maps JS Places library and wraps Autocomplete + Details.
 *
 * Prefer registering via {@link provideGooglePlaces}. When the config token is
 * missing or `apiKey` is empty, prediction / detail calls resolve to empty /
 * null without throwing.
 */
@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(GOOGLE_PLACES_CONFIG, { optional: true });

  private loadPromise: Promise<void> | null = null;
  private autocomplete: GoogleAutocompleteService | null = null;
  private places: GooglePlacesServiceApi | null = null;

  /**
   * @param query - Free-text search.
   * @param countries - Optional ISO-3166-1 alpha-2 country codes to restrict.
   * @returns Autocomplete predictions (may be empty).
   */
  async getPredictions(
    query: string,
    countries?: string[],
  ): Promise<AddressPrediction[]> {
    const trimmed = query.trim();
    if (!trimmed || !this.hasApiKey()) {
      return [];
    }

    await this.ensureLoaded();
    const service = this.autocomplete;
    const statusOk = this.placesStatusOk();
    if (!service || !statusOk) {
      return [];
    }

    return new Promise((resolve) => {
      service.getPlacePredictions(
        {
          input: trimmed,
          ...(countries?.length
            ? {
                componentRestrictions: {
                  country: countries.length === 1 ? countries[0] : countries,
                },
              }
            : {}),
        },
        (predictions, status) => {
          if (status !== statusOk.OK || !predictions?.length) {
            resolve([]);
            return;
          }
          resolve(
            predictions.map((p) => ({
              placeId: p.place_id,
              description: p.description,
              mainText: p.structured_formatting?.main_text,
              secondaryText: p.structured_formatting?.secondary_text,
            })),
          );
        },
      );
    });
  }

  /**
   * @param placeId - Google place id from a prediction.
   * @returns Structured place details, or `null` on failure.
   */
  async getPlaceDetails(placeId: string): Promise<AddressPlace | null> {
    if (!placeId || !this.hasApiKey()) {
      return null;
    }

    await this.ensureLoaded();
    const service = this.places;
    const statusOk = this.placesStatusOk();
    if (!service || !statusOk) {
      return null;
    }

    return new Promise((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: [
            'place_id',
            'formatted_address',
            'name',
            'geometry',
            'address_components',
          ],
        },
        (place, status) => {
          if (status !== statusOk.OK || !place) {
            resolve(null);
            return;
          }
          resolve(mapPlaceResult(place));
        },
      );
    });
  }

  private hasApiKey(): boolean {
    return Boolean(this.config?.apiKey?.trim());
  }

  private placesStatusOk(): { OK: string } | null {
    const places = (this.document.defaultView as GoogleMapsWindow | null)?.google
      ?.maps?.places;
    return places?.PlacesServiceStatus ?? null;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.hasApiKey()) {
      return;
    }

    if (!this.loadPromise) {
      this.loadPromise = this.loadScript().then(() => this.initClients());
    }

    await this.loadPromise;
  }

  private loadScript(): Promise<void> {
    const win = this.document.defaultView as GoogleMapsWindow | null;
    if (win?.google?.maps?.places) {
      return Promise.resolve();
    }

    const existing = this.document.getElementById(SCRIPT_ID);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Google Maps script failed to load')),
          { once: true },
        );
      });
    }

    const apiKey = this.config?.apiKey?.trim();
    if (!apiKey) {
      return Promise.resolve();
    }
    const params = new URLSearchParams({
      key: apiKey,
      libraries: 'places',
      loading: 'async',
    });
    if (this.config?.language) {
      params.set('language', this.config.language);
    }
    if (this.config?.region) {
      params.set('region', this.config.region);
    }

    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Google Maps script failed to load'));
      this.document.head.appendChild(script);
    });
  }

  private initClients(): void {
    const places = (this.document.defaultView as GoogleMapsWindow | null)?.google
      ?.maps?.places;
    if (!places) {
      throw new Error('Google Maps Places library is unavailable');
    }
    this.autocomplete = new places.AutocompleteService();
    const attribution = this.document.createElement('div');
    this.places = new places.PlacesService(attribution);
  }
}

/**
 * @param place - Raw PlacesService result.
 * @returns Normalized {@link AddressPlace}.
 */
function mapPlaceResult(place: GooglePlaceResult): AddressPlace {
  const components: AddressComponent[] = (place.address_components ?? []).map(
    (c) => ({
      longName: c.long_name,
      shortName: c.short_name,
      types: c.types,
    }),
  );

  const find = (type: string): AddressComponent | undefined =>
    components.find((c) => c.types.includes(type));

  const streetNumber = find('street_number');
  const route = find('route');
  const locality =
    find('locality') ??
    find('postal_town') ??
    find('sublocality') ??
    find('administrative_area_level_2');
  const admin1 = find('administrative_area_level_1');
  const country = find('country');
  const postal = find('postal_code');

  return {
    placeId: place.place_id ?? '',
    formattedAddress: place.formatted_address ?? '',
    name: place.name,
    lat: place.geometry?.location?.lat(),
    lng: place.geometry?.location?.lng(),
    streetNumber: streetNumber?.longName,
    route: route?.longName,
    locality: locality?.longName,
    administrativeAreaLevel1: admin1?.longName,
    country: country?.longName,
    countryCode: country?.shortName,
    postalCode: postal?.longName,
    addressComponents: components.length ? components : undefined,
  };
}
