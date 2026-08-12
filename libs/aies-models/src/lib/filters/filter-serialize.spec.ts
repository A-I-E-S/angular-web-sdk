import { FilterParams, FilterState, ModuleFilterConfig } from './filter-config.model';
import { cloneFilterState, emptyFilterState, fromFilterParams, toFilterParams } from './filter-serialize';

describe('filter-serialize', () => {
  const config: ModuleFilterConfig = {
    id: 'track-shipments',
    transport: 'legacy-parallel',
    search: { param: 'search', label: 'Shipment ID' },
    date: {
      rangeParams: { from: 'from', to: 'to' },
      fieldParam: 'date',
      fields: [{ value: 'created_at', label: 'Date Created' }],
    },
    sort: {
      param: 'order',
      options: [
        { value: 'asc', label: 'Ascending' },
        { value: 'desc', label: 'Descending' },
      ],
    },
    fields: [
      {
        key: 'payment_status',
        label: 'Payment Status',
        type: 'enum',
        options: [
          { value: 'paid', label: 'Paid' },
          { value: 'unpaid', label: 'Unpaid' },
        ],
      },
      {
        key: 'shipment_status',
        label: 'Shipment Status',
        type: 'enum',
        options: [{ value: 'pending', label: 'Pending' }],
      },
    ],
  };

  it('serializes legacy-parallel columns and values in field order', () => {
    const state: FilterState = {
      search: 'SFN-1',
      from: '2026-01-01',
      to: '2026-01-31',
      date: 'created_at',
      order: 'desc',
      page: 2,
      size: 20,
      values: {
        payment_status: 'paid',
        shipment_status: 'pending',
      },
    };

    const params = toFilterParams(state, config);
    expect(params).toEqual({
      search: 'SFN-1',
      from: '2026-01-01',
      to: '2026-01-31',
      date: 'created_at',
      order: 'desc',
      page: 2,
      size: 20,
      filterColumn: 'payment_status,shipment_status',
      filterValue: 'paid,pending',
    });
  });

  it('omits empty field values from legacy CSV', () => {
    const state: FilterState = {
      values: { payment_status: 'paid', shipment_status: undefined },
    };
    const params = toFilterParams(state, config);
    expect(params['filterColumn']).toBe('payment_status');
    expect(params['filterValue']).toBe('paid');
  });

  it('hydrates legacy CSV back into a values map', () => {
    const params: FilterParams = {
      search: 'SFN-1',
      filterColumn: 'payment_status,shipment_status',
      filterValue: 'paid,pending',
      page: 1,
    };
    const state = fromFilterParams(params, config);
    expect(state.search).toBe('SFN-1');
    expect(state.page).toBe(1);
    expect(state.values).toEqual({
      payment_status: 'paid',
      shipment_status: 'pending',
    });
  });

  it('round-trips named transport', () => {
    const named: ModuleFilterConfig = {
      ...config,
      id: 'named-demo',
      transport: 'named',
      fields: [
        {
          key: 'claim_status',
          label: 'Claim',
          type: 'enum',
          options: [{ value: 'open', label: 'Open' }],
        },
      ],
    };
    const state: FilterState = {
      values: { claim_status: 'open' },
      search: 'x',
    };
    const params = toFilterParams(state, named);
    expect(params['claim_status']).toBe('open');
    expect(params['filterColumn']).toBeUndefined();
    expect(fromFilterParams(params, named).values['claim_status']).toBe('open');
  });

  it('clones without sharing the values object', () => {
    const state = emptyFilterState();
    expect(state.order).toBe('desc');
    state.values['a'] = '1';
    const copy = cloneFilterState(state);
    copy.values['a'] = '2';
    expect(state.values['a']).toBe('1');
  });
});
