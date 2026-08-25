import {
  type EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { AFRICANIES_HTTP_TOAST } from '@africanies/africanies-core';

import { ToastService } from './toast.service';

/**
 * Registers {@link ToastService}, mounts the toast host, and bridges HTTP
 * toasts via {@link AFRICANIES_HTTP_TOAST} (used by {@link httpToastInterceptor}).
 *
 * Pair with {@link provideAfricaniesHttpClient} so {@link withToast} works.
 *
 * @returns Environment providers for `app.config.ts`.
 *
 * @example
 * ```ts
 * providers: [
 *   provideAfricaniesHttpClient(),
 *   provideAfricaniesUiOverlays(),
 *   provideAfricaniesToasts(),
 * ]
 * ```
 */
export function provideAfricaniesToasts(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ToastService,
    { provide: AFRICANIES_HTTP_TOAST, useExisting: ToastService },
    provideAppInitializer(() => {
      inject(ToastService).ensureHost();
    }),
  ]);
}
