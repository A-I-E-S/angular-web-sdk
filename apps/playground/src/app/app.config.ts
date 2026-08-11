import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  authInterceptor,
  provideAiesSdk,
  shipmentModeInterceptor,
} from '@aies/aies-core';
import { provideAiesUiOverlays } from '@aies/aies-ui';
import { ThemeService } from '@aies/aies-theme';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAiesSdk({ baseUrl: 'https://example.invalid' }),
    provideHttpClient(
      withInterceptors([shipmentModeInterceptor, authInterceptor]),
    ),
    provideAiesUiOverlays(),
    provideAppInitializer(() => {
      // Apply stored / system theme before first paint of themed chrome.
      inject(ThemeService);
    }),
  ],
};
