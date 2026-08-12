import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { AIES_HTTP_TOAST } from '@aies/aies-core';

import { ToastService } from './toast.service';

/**
 * Registers {@link ToastService}, mounts the toast host, and bridges HTTP
 * toasts via {@link AIES_HTTP_TOAST} (used by {@link httpToastInterceptor}).
 *
 * Pair with {@link provideAiesHttpClient} so {@link withToast} works.
 *
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * providers: [
 *   provideAiesHttpClient(),
 *   provideAiesUiOverlays(),
 *   provideAiesToasts(),
 * ]
 * ```
 */
export function provideAiesToasts(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ToastService,
    { provide: AIES_HTTP_TOAST, useExisting: ToastService },
    provideAppInitializer(() => {
      inject(ToastService).ensureHost();
    }),
  ]);
}
