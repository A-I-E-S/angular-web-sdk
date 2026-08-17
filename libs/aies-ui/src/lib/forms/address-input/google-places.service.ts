import { inject, Injectable } from '@angular/core';

import type {
  AddressComponent,
  AddressPlace,
  AddressPrediction,
} from './address-input.types';
import { GOOGLE_PLACES_CONFIG } from './google-places.token';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';

const AUTOCOMPLETE_FIELD_MASK = [
  'suggestions.placePrediction.placeId',
  'suggestions.placePrediction.text',
  'suggestions.placePrediction.structuredFormat',
  'suggestions.placePrediction.types',
].join(',');

const PLACE_DETAILS_FIELD_MASK =
  'id,displayName,formattedAddress,addressComponents,location';

interface AutocompleteApiResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
}

interface PlaceDetailsApiResponse {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
  location?: {
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Places API (New) over REST — same contract as the working React
 * autocomplete (`POST …/places:autocomplete`, `GET …/places/{id}`).
 *
 * No Maps JavaScript widget, AutocompleteService, or PlacesService.
 * Register {@link provideGooglePlaces} with a key that has Places API (New).
 */
@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private readonly config = inject(GOOGLE_PLACES_CONFIG, { optional: true });

  /**
   * @param query - Free-text search.
   * @param countries - Optional ISO-3166-1 alpha-2 codes (`includedRegionCodes`).
   * @returns Autocomplete predictions (may be empty).
   */
  async getPredictions(
    query: string,
    countries?: string[],
  ): Promise<AddressPrediction[]> {
    const apiKey = this.apiKey();
    const trimmed = query.trim();
    if (!trimmed || !apiKey) {
      return [];
    }

    const body: Record<string, unknown> = { input: trimmed };
    const regionCodes = (countries ?? [])
      .map((code) => code.trim().toLowerCase())
      .filter(Boolean);
    if (regionCodes.length) {
      body['includedRegionCodes'] = regionCodes;
    } else if (this.config?.region?.trim()) {
      body['includedRegionCodes'] = [this.config.region.trim().toLowerCase()];
    }
    if (this.config?.language?.trim()) {
      body['languageCode'] = this.config.language.trim();
    }

    const data = await placesFetch<AutocompleteApiResponse>(
      AUTOCOMPLETE_URL,
      apiKey,
      {
        method: 'POST',
        fieldMask: AUTOCOMPLETE_FIELD_MASK,
        body: JSON.stringify(body),
      },
    );

    const predictions: AddressPrediction[] = [];
    for (const item of data.suggestions ?? []) {
      const prediction = item.placePrediction;
      const placeId = prediction?.placeId?.trim();
      if (!prediction || !placeId) {
        continue;
      }
      const description =
        prediction.text?.text?.trim() ||
        prediction.structuredFormat?.mainText?.text?.trim() ||
        '';
      if (!description) {
        continue;
      }
      const mapped: AddressPrediction = { placeId, description };
      const mainText = prediction.structuredFormat?.mainText?.text?.trim();
      const secondaryText =
        prediction.structuredFormat?.secondaryText?.text?.trim();
      if (mainText) {
        mapped.mainText = mainText;
      }
      if (secondaryText) {
        mapped.secondaryText = secondaryText;
      }
      predictions.push(mapped);
    }
    return predictions;
  }

  /**
   * @param placeId - Place id from a prediction (`ChIJ…` or `places/ChIJ…`).
   * @returns Structured place details, or `null` on failure.
   */
  async getPlaceDetails(placeId: string): Promise<AddressPlace | null> {
    const apiKey = this.apiKey();
    const id = normalizePlaceId(placeId);
    if (!id || !apiKey) {
      return null;
    }

    const details = await placesFetch<PlaceDetailsApiResponse>(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
      apiKey,
      {
        method: 'GET',
        fieldMask: PLACE_DETAILS_FIELD_MASK,
      },
    );

    return mapPlaceDetails(details, id);
  }

  private apiKey(): string {
    return this.config?.apiKey?.trim() ?? '';
  }
}

async function placesFetch<T>(
  url: string,
  apiKey: string,
  init: RequestInit & { fieldMask: string },
): Promise<T> {
  const { fieldMask, ...requestInit } = init;
  const response = await fetch(url, {
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
      ...requestInit.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await placesErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function placesErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    if (body.error?.message?.trim()) {
      return body.error.message.trim();
    }
  } catch {
    // ignore non-JSON error bodies
  }
  switch (response.status) {
    case 401:
      return 'Authentication failed. Please check your API key.';
    case 403:
      return 'Access denied. Enable Places API (New) for this key.';
    case 429:
      return 'Too many requests. Please try again in a moment.';
    default:
      return `Places API request failed (${response.status}).`;
  }
}

function normalizePlaceId(placeId: string): string {
  const trimmed = placeId.trim();
  return trimmed.startsWith('places/') ? trimmed.slice('places/'.length) : trimmed;
}

function mapPlaceDetails(
  details: PlaceDetailsApiResponse,
  fallbackId: string,
): AddressPlace {
  const components: AddressComponent[] = (details.addressComponents ?? []).map(
    (component) => ({
      longName: component.longText ?? '',
      shortName: component.shortText ?? '',
      types: component.types ?? [],
    }),
  );
  const find = (type: string): AddressComponent | undefined =>
    components.find((component) => component.types.includes(type));

  const locality =
    find('locality') ??
    find('postal_town') ??
    find('sublocality') ??
    find('neighborhood') ??
    find('administrative_area_level_2');
  const country = find('country');
  const landmark =
    find('landmark') ??
    find('neighborhood') ??
    find('sublocality') ??
    find('premise') ??
    find('point_of_interest');

  return {
    placeId: details.id || fallbackId,
    formattedAddress: details.formattedAddress ?? '',
    name: details.displayName?.text?.trim() || undefined,
    lat: details.location?.latitude,
    lng: details.location?.longitude,
    streetNumber: find('street_number')?.longName,
    route: find('route')?.longName,
    locality: locality?.longName,
    administrativeAreaLevel1: find('administrative_area_level_1')?.longName,
    administrativeAreaLevel1Code: find('administrative_area_level_1')?.shortName,
    country: country?.longName,
    countryCode: country?.shortName,
    postalCode: find('postal_code')?.longName,
    landmark: landmark?.longName || undefined,
    addressComponents: components.length ? components : undefined,
  };
}
