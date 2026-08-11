import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';

import { ModeConfigService } from './mode-config.service';

/**
 * Fetches `/public/mode/config` on app startup and hydrates {@link ModeConfigService}.
 *
 * Failures do not block bootstrap — cached storage (if any) remains usable.
 * Pair with {@link provideAiesSdk} and a real {@link AiesSdkConfig.baseUrl}.
 */
export function provideModeConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const modeConfig = inject(ModeConfigService);
      return firstValueFrom(
        modeConfig.loadConfig().pipe(catchError(() => of(null))),
      );
    }),
  ]);
}
