import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideAiesHttpClient, provideAiesSdk } from '@aies/aies-core';
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
        provideAiesHttpClient(),
        provideAiesUiOverlays(),
      ],
    }).compileComponents();
  });

  it('should render catalog shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('aies-app-shell')).toBeTruthy();
    expect(compiled.textContent).toContain('Playground');
    expect(compiled.textContent).toContain('Import');
    expect(compiled.textContent).toContain('Export');
  });
});
