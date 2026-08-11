import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
import { STORAGE_TOKEN } from './storage.token';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    const localStorageMock: Storage = {
      get length() {
        return Object.keys(store).length;
      },
      clear: () => {
        store = {};
      },
      getItem: (key: string) => (key in store ? store[key] : null),
      key: (index: number) => Object.keys(store)[index] ?? null,
      removeItem: (key: string) => {
        delete store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    store = {};
  });

  it('should be provided via STORAGE_TOKEN by default', () => {
    expect(TestBed.inject(STORAGE_TOKEN)).toBeInstanceOf(LocalStorageService);
  });

  it('should set and get a typed value', () => {
    service.set('prefs', { dense: true, count: 2 });

    expect(service.get<{ dense: boolean; count: number }>('prefs')).toEqual({
      dense: true,
      count: 2,
    });
    expect(store['prefs']).toBe(JSON.stringify({ dense: true, count: 2 }));
  });

  it('should return null for a missing key', () => {
    expect(service.get('missing')).toBeNull();
  });

  it('should remove a key', () => {
    service.set('temp', 'value');
    service.remove('temp');

    expect(service.get('temp')).toBeNull();
    expect(store['temp']).toBeUndefined();
  });

  it('should clear all keys', () => {
    service.set('a', 1);
    service.set('b', 2);
    service.clear();

    expect(service.get('a')).toBeNull();
    expect(service.get('b')).toBeNull();
    expect(Object.keys(store)).toHaveLength(0);
  });
});
