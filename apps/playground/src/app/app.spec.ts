import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  authInterceptor,
  provideAiesSdk,
  shipmentModeInterceptor,
} from '@aies/aies-core';
import { provideAiesUiOverlays } from '@aies/aies-ui';

import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(appRoutes),
        provideAiesSdk({ baseUrl: 'https://example.invalid' }),
        provideHttpClient(
          withInterceptors([shipmentModeInterceptor, authInterceptor]),
        ),
        provideAiesUiOverlays(),
      ],
    }).compileComponents();
  });

  it('should render catalog shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('AIES');
    expect(compiled.textContent).toContain('Web SDK playground');
  });
});
