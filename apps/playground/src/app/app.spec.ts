import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideAfricaniesHttpClient, provideAfricaniesSdk } from '@africanies/africanies-core';
import { provideAfricaniesUiOverlays } from '@africanies/africanies-ui';

import { App } from './app';
import { appRoutes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(appRoutes),
        provideAfricaniesSdk({ baseUrl: 'https://example.invalid' }),
        provideAfricaniesHttpClient(),
        provideAfricaniesUiOverlays(),
      ],
    }).compileComponents();
  });

  it('should render catalog shell', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('africanies-app-shell')).toBeTruthy();
    expect(compiled.textContent).toContain('Playground');
    expect(compiled.textContent).toContain('Import');
    expect(compiled.textContent).toContain('Export');
  });
});
