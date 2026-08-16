import { normalize, normalizePagination, unwrapLaravelPaginator } from './normalize';

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
