import { normalize, normalizePagination, unwrapLaravelPaginator } from './normalize';
import {
  fieldErrorsMap,
  joinApiErrorMessages,
} from './validation-bag';

describe('normalize', () => {
  it('keeps flat list + top-level pagination unchanged', () => {
    const result = normalize<{ id: number }[]>({
      success: true,
      status_code: 200,
      message: 'OK',
      data: [{ id: 1 }],
      pagination: {
        current_page: 1,
        per_page: 20,
        total_items: 1,
        total_pages: 1,
        has_next_page: false,
        has_previous_page: false,
      },
    });

    expect(result.data).toEqual([{ id: 1 }]);
    expect(result.pagination).toEqual({
      current_page: 1,
      per_page: 20,
      total_items: 1,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    });
  });

  it('unwraps Laravel paginator nested in data', () => {
    const result = normalize<{ id: number; name: string }[]>({
      success: true,
      status_code: 200,
      message: 'Record fetched',
      data: {
        current_page: 1,
        data: [{ id: 12, name: 'Africanies Air Expedited' }],
        last_page: 1,
        per_page: 10,
        total: 5,
        next_page_url: null,
        prev_page_url: null,
      },
    });

    expect(result.data).toEqual([{ id: 12, name: 'Africanies Air Expedited' }]);
    expect(result.pagination).toEqual({
      current_page: 1,
      per_page: 10,
      total_items: 5,
      total_pages: 1,
      has_next_page: false,
      has_previous_page: false,
    });
  });

  it('unwraps Laravel paginator when nested data is null', () => {
    const result = normalize<unknown[]>({
      success: true,
      status_code: 200,
      message: 'OK',
      data: {
        current_page: 1,
        data: null,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
    });

    expect(result.data).toEqual([]);
    expect(result.pagination?.total_items).toBe(0);
  });

  it('does not treat single records with nested paginators as list pages', () => {
    const result = normalize<{ id: number; zone_values: unknown }>({
      success: true,
      data: {
        id: 12,
        zone_values: {
          current_page: 1,
          data: [],
          last_page: 1,
          per_page: 10,
          total: 0,
        },
      },
    });

    expect(result.data?.id).toBe(12);
    expect(result.pagination).toBeNull();
  });

  it('lifts a Laravel validation bag from failure data into errors', () => {
    const result = normalize({
      success: false,
      status_code: 424,
      message: 'The name field is required.',
      data: {
        name: ['The name field is required.'],
        value: ['The value field is required.'],
        currency: ['The currency field is required.'],
      },
    });

    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors).toEqual([
      { field: 'name', message: 'The name field is required.', code: null },
      { field: 'value', message: 'The value field is required.', code: null },
      {
        field: 'currency',
        message: 'The currency field is required.',
        code: null,
      },
    ]);
    expect(result.message).toBe(
      [
        'The name field is required.',
        'The value field is required.',
        'The currency field is required.',
      ].join('\n'),
    );
  });

  it('lifts a Laravel validation bag from the errors object map', () => {
    const result = normalize({
      success: false,
      status_code: 422,
      message: 'Validation failed',
      data: null,
      errors: {
        email: ['The email field is required.', 'The email must be valid.'],
      },
    });

    expect(result.errors).toEqual([
      { field: 'email', message: 'The email field is required.', code: null },
      { field: 'email', message: 'The email must be valid.', code: null },
    ]);
    expect(fieldErrorsMap(result.errors)).toEqual({
      email: 'The email field is required.',
    });
    expect(joinApiErrorMessages(result.errors)).toBe(
      'The email field is required.\nThe email must be valid.',
    );
  });

  it('joins a string error array onto message with newlines', () => {
    const result = normalize({
      success: false,
      status_code: 422,
      message: 'Validation failed',
      data: null,
      errors: ['Warehouse length is required.', 'Warehouse width is required.'],
    });

    expect(result.errors).toEqual([
      { field: null, message: 'Warehouse length is required.', code: null },
      { field: null, message: 'Warehouse width is required.', code: null },
    ]);
    expect(result.message).toBe(
      'Warehouse length is required.\nWarehouse width is required.',
    );
  });

  it('joins a message string array when errors are absent', () => {
    const result = normalize({
      success: false,
      status_code: 422,
      message: ['Price monthly is required.', 'Discount is required.'],
      data: null,
      errors: null,
    });

    expect(result.errors).toBeNull();
    expect(result.message).toBe(
      'Price monthly is required.\nDiscount is required.',
    );
  });
});

describe('normalizePagination', () => {
  it('maps Laravel total and last_page fields', () => {
    expect(
      normalizePagination({
        current_page: 2,
        per_page: 15,
        total: 587,
        last_page: 59,
        next_page_url: 'https://example.com?page=3',
        prev_page_url: 'https://example.com?page=1',
      }),
    ).toEqual({
      current_page: 2,
      per_page: 15,
      total_items: 587,
      total_pages: 59,
      has_next_page: true,
      has_previous_page: true,
    });
  });
});

describe('unwrapLaravelPaginator', () => {
  it('returns raw arrays unchanged', () => {
    expect(unwrapLaravelPaginator([{ id: 1 }])).toEqual({
      data: [{ id: 1 }],
      pagination: null,
    });
  });
});
