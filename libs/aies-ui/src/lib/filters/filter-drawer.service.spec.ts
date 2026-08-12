import { TestBed } from '@angular/core/testing';

import { Subject } from 'rxjs';

import { trackShipmentsFilterConfig } from '@aies/aies-models';

import { DrawerService } from '../overlay/drawer.service';
import { FilterDrawerPanel } from './filter-drawer.panel';
import { FilterDrawerService } from './filter-drawer.service';
import type { FilterDrawerResult } from './filter-drawer.types';

describe('FilterDrawerService', () => {
  let service: FilterDrawerService;
  let drawerOpen: jest.Mock;
  let afterClosed$: Subject<FilterDrawerResult | undefined>;

  beforeEach(() => {
    afterClosed$ = new Subject<FilterDrawerResult | undefined>();
    drawerOpen = jest.fn().mockReturnValue({
      afterClosed: () => afterClosed$.asObservable(),
      close: jest.fn(),
    });

    TestBed.configureTestingModule({
      providers: [
        FilterDrawerService,
        { provide: DrawerService, useValue: { open: drawerOpen } },
      ],
    });

    service = TestBed.inject(FilterDrawerService);
  });

  it('should open FilterDrawerPanel through DrawerService with dismissible drawer', () => {
    const state = { values: {} };

    service.open({
      config: trackShipmentsFilterConfig,
      state,
    });

    expect(drawerOpen).toHaveBeenCalledTimes(1);
    expect(drawerOpen).toHaveBeenCalledWith(FilterDrawerPanel, {
      data: {
        config: trackShipmentsFilterConfig,
        state,
      },
      dismissible: true,
    });
  });

  it('should forward optional onApply to drawer data', () => {
    const onApply = jest.fn().mockResolvedValue(undefined);

    service.open({
      config: trackShipmentsFilterConfig,
      state: { values: {} },
      onApply,
    });

    expect(drawerOpen.mock.calls[0][1].data.onApply).toBe(onApply);
  });

  it('should expose afterClosed from the drawer handle', () => {
    const next = jest.fn();
    const handle = service.open({
      config: trackShipmentsFilterConfig,
      state: { values: {} },
    });

    handle.afterClosed().subscribe(next);
    afterClosed$.next({ applied: true, state: { values: {} } });

    expect(next).toHaveBeenCalledWith({ applied: true, state: { values: {} } });
  });
});
