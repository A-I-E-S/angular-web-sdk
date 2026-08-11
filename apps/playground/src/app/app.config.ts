import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import {
  authInterceptor,
  provideAiesSdk,
  shipmentModeInterceptor,
} from '@aies/aies-core';
import { ThemeService } from '@aies/aies-theme';
import { provideAiesUiOverlays } from '@aies/aies-ui';

import { appRoutes } from './app.routes';

/** Test export API — mode config loads from GET /public/mode/config on startup. */
const PLAYGROUND_API_BASE = 'https://test-api-export.africaniestest.com/api';

export /**
 *
 */
const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAiesSdk({ baseUrl: PLAYGROUND_API_BASE }),
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
