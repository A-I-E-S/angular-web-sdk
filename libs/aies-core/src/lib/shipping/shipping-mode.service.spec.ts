import { TestBed } from '@angular/core/testing';

import {
  AIES_SHIPPING_MODE_KEY,
  SessionStorageService,
} from '@aies/aies-storage';

import { ApiClient } from '../http/api-client';
import { ShippingModeService } from './shipping-mode.service';

describe('ShippingModeService', () => {
  let storage: { get: jest.Mock; set: jest.Mock; remove: jest.Mock };
  let clearCache: jest.Mock;

  function createService(
    initialStored: 'sfn' | 'stn' | null = null,
  ): ShippingModeService {
    storage = {
      get: jest.fn().mockReturnValue(initialStored),
      set: jest.fn(),
      remove: jest.fn(),
    };
    clearCache = jest.fn();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ShippingModeService,
        { provide: SessionStorageService, useValue: storage },
        { provide: ApiClient, useValue: { clearCache } },
      ],
    });

    return TestBed.inject(ShippingModeService);
  }

  it('hydrates from storage on construct', () => {
    const service = createService('stn');
    expect(service.mode()).toBe('stn');
  });

  it('defaults to sfn when storage is empty', () => {
    const service = createService(null);
    expect(service.mode()).toBe('sfn');
  });

  it('setMode persists to session storage and clears the HTTP cache', () => {
    const service = createService('sfn');
    service.setMode('stn');
    expect(service.mode()).toBe('stn');
    expect(storage.set).toHaveBeenCalledWith(AIES_SHIPPING_MODE_KEY, 'stn');
    expect(clearCache).toHaveBeenCalledTimes(1);
  });

  it('setMode no-ops when mode is unchanged', () => {
    const service = createService('sfn');
    service.setMode('sfn');
    expect(storage.set).not.toHaveBeenCalled();
    expect(clearCache).not.toHaveBeenCalled();
  });
});
