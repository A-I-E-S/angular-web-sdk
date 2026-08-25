import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { trackShipmentsFilterConfig } from '@africanies/africanies-models';

import { FilterQueryService } from './filter-query.service';

@Component({
  standalone: true,
  template: '',
})
class FilterQueryHostComponent {}

describe('FilterQueryService', () => {
  let service: FilterQueryService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterQueryHostComponent],
      providers: [
        provideRouter([{ path: '', component: FilterQueryHostComponent }]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    service = TestBed.inject(FilterQueryService);
    await router.navigateByUrl('/');
  });

  it('hasParams is false on an empty query string', () => {
    expect(service.hasParams(trackShipmentsFilterConfig)).toBe(false);
  });

  it('reads page, size, and filter keys from the URL when present', async () => {
    await router.navigateByUrl(
      '/?page=2&size=30&search=SFN&filterColumn=payment_status&filterValue=paid',
    );

    expect(service.hasParams(trackShipmentsFilterConfig)).toBe(true);
    const state = service.read(trackShipmentsFilterConfig);
    expect(state.page).toBe(2);
    expect(state.size).toBe(30);
    expect(state.search).toBe('SFN');
    expect(state.values['payment_status']).toBe('paid');
  });

  it('write replaces filter keys and keeps unrelated query params', async () => {
    await router.navigateByUrl('/?modal=edit-shipment&search=OLD&page=4');

    await service.write(
      {
        search: 'NEW',
        page: 1,
        size: 15,
        values: { payment_status: 'unpaid' },
      },
      trackShipmentsFilterConfig,
    );

    expect(router.url).toContain('modal=edit-shipment');
    expect(router.url).toContain('search=NEW');
    expect(router.url).toContain('page=1');
    expect(router.url).toContain('size=15');
    expect(router.url).toContain('filterColumn=payment_status');
    expect(router.url).toContain('filterValue=unpaid');
    expect(router.url).not.toContain('search=OLD');
  });

  it('setPage merges page without dropping sibling params', async () => {
    await router.navigateByUrl('/?search=SFN&page=1');
    await service.setPage(3);
    expect(router.url).toContain('search=SFN');
    expect(router.url).toContain('page=3');
  });

  it('setSize writes size and resets page to 1', async () => {
    await router.navigateByUrl('/?page=4&size=15');
    await service.setSize(30);
    expect(router.url).toContain('page=1');
    expect(router.url).toContain('size=30');
  });
});
