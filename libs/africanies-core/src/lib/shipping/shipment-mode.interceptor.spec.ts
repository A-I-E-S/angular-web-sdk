import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { of } from 'rxjs';

import { shipmentModeInterceptor } from './shipment-mode.interceptor';
import { withShippingMode } from './shipping-mode.context';
import { ShippingModeService } from './shipping-mode.service';

describe('shipmentModeInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ShippingModeService,
          useValue: { mode: () => 'sfn' },
        },
      ],
    });
  });

  it('uses the tab shipping mode by default', (done) => {
    const req = new HttpRequest('GET', '/public/service/read');
    TestBed.runInInjectionContext(() => {
      shipmentModeInterceptor(req, (next) => {
        expect(next.headers.get('x-shipment-mode')).toBe('sfn');
        return of(next);
      }).subscribe(() => done());
    });
  });

  it('overrides the header for one request without reading setMode', (done) => {
    const req = new HttpRequest('POST', '/claim', null, {
      context: withShippingMode('stn'),
    });
    TestBed.runInInjectionContext(() => {
      shipmentModeInterceptor(req, (next) => {
        expect(next.headers.get('x-shipment-mode')).toBe('stn');
        return of(next);
      }).subscribe(() => done());
    });
  });
});
