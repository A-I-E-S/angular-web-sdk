import { TestBed } from '@angular/core/testing';

import { AIES_ACCESS_TOKEN_KEY, STORAGE_TOKEN } from '@aies/aies-storage';

import { ApiClient } from '../http/api-client';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  let storage: { get: jest.Mock; set: jest.Mock; remove: jest.Mock };
  let clearCache: jest.Mock;

  function createService(
    initialStored: string | null = null,
  ): AuthTokenService {
    storage = {
      get: jest.fn().mockReturnValue(initialStored),
      set: jest.fn(),
      remove: jest.fn(),
    };
    clearCache = jest.fn();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthTokenService,
        { provide: STORAGE_TOKEN, useValue: storage },
        { provide: ApiClient, useValue: { clearCache } },
      ],
    });

    return TestBed.inject(AuthTokenService);
  }

  it('set persists and returns the token', () => {
    const service = createService();
    service.set('  abc.token  ');
    expect(service.get()).toBe('abc.token');
    expect(service.token()).toBe('abc.token');
    expect(storage.set).toHaveBeenCalledWith(
      AIES_ACCESS_TOKEN_KEY,
      'abc.token',
    );
  });

  it('clear removes storage and clears the HTTP cache', () => {
    const service = createService();
    service.set('tok');
    service.clear();
    expect(service.get()).toBeNull();
    expect(storage.remove).toHaveBeenCalledWith(AIES_ACCESS_TOKEN_KEY);
    expect(clearCache).toHaveBeenCalled();
  });

  it('hydrates from storage on construct', () => {
    const service = createService('stored-token');
    expect(service.get()).toBe('stored-token');
  });

  it('set with blank string clears', () => {
    const service = createService();
    service.set('tok');
    service.set('   ');
    expect(service.get()).toBeNull();
    expect(storage.remove).toHaveBeenCalled();
  });
});
