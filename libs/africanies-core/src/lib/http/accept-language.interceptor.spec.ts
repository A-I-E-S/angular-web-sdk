import { HttpRequest } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { AFRICANIES_HTTP_ACCEPT_LANGUAGE } from './accept-language.context';
import { acceptLanguageInterceptor } from './accept-language.interceptor';

describe('acceptLanguageInterceptor', () => {
  it('sets Accept-Language from the host language signal', (done) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AFRICANIES_HTTP_ACCEPT_LANGUAGE,
          useValue: signal('zh'),
        },
      ],
    });
    const req = new HttpRequest('GET', '/user/target/read/all');
    TestBed.runInInjectionContext(() => {
      acceptLanguageInterceptor(req, (next) => {
        expect(next.headers.get('Accept-Language')).toBe('zh');
        return of(next);
      }).subscribe(() => done());
    });
  });

  it('leaves the header unset when the host does not provide a language', (done) => {
    TestBed.configureTestingModule({ providers: [] });
    const req = new HttpRequest('GET', '/user/target/read/all');
    TestBed.runInInjectionContext(() => {
      acceptLanguageInterceptor(req, (next) => {
        expect(next.headers.has('Accept-Language')).toBe(false);
        return of(next);
      }).subscribe(() => done());
    });
  });

  it('skips blank language codes', (done) => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AFRICANIES_HTTP_ACCEPT_LANGUAGE,
          useValue: signal('  '),
        },
      ],
    });
    const req = new HttpRequest('GET', '/user/target/read/all');
    TestBed.runInInjectionContext(() => {
      acceptLanguageInterceptor(req, (next) => {
        expect(next.headers.has('Accept-Language')).toBe(false);
        return of(next);
      }).subscribe(() => done());
    });
  });
});
