import { listFetchKind } from './list-fetch-kind';

describe('listFetchKind', () => {
  it('uses body loading when there is no data', () => {
    expect(listFetchKind({ hasData: false, reason: 'initial' })).toBe(
      'loading',
    );
    expect(listFetchKind({ hasData: false, reason: 'focus' })).toBe('loading');
    expect(listFetchKind({ hasData: false, reason: 'refresh' })).toBe(
      'loading',
    );
    expect(listFetchKind({ hasData: false, reason: 'page' })).toBe('loading');
  });

  it('uses body loading when shipping mode switches, even with rows', () => {
    expect(listFetchKind({ hasData: true, reason: 'mode' })).toBe('loading');
  });

  it('keeps rows for pagination, focus, and refresh when data exists', () => {
    expect(listFetchKind({ hasData: true, reason: 'page' })).toBe(
      'pagination',
    );
    expect(listFetchKind({ hasData: true, reason: 'focus' })).toBe(
      'refreshing',
    );
    expect(listFetchKind({ hasData: true, reason: 'refresh' })).toBe(
      'refreshing',
    );
    expect(listFetchKind({ hasData: true, reason: 'initial' })).toBe(
      'refreshing',
    );
  });
});
