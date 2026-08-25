/**
 * Shared TanStack Query defaults for AFRICANIES consuming apps.
 *
 * `@tanstack/angular-query-experimental` is **not** a dependency of this SDK —
 * query cache lifetime is app state. These helpers return a plain
 * `defaultOptions` object you pass into your own `QueryClient`.
 *
 * Pin an **exact** `@tanstack/angular-query-experimental` version in the app
 * (no caret/tilde): TanStack marks the Angular adapter experimental and
 * breaking changes land without major bumps.
 *
 * Retry/backoff here mirrors {@link ApiClient}'s GET retry (max 3,
 * exponential) so HTTP-layer and query-layer behavior stay aligned.
 */

/**
 * Shape compatible with TanStack `QueryClient` `defaultOptions` without
 * importing `@tanstack/*` into the SDK.
 */
export interface AfricaniesQueryClientDefaults {
  queries: {
    /** Time before a successful query is considered stale (ms). */
    staleTime: number;
    /** Unused-query garbage-collection time (ms). */
    gcTime: number;
    /** Max failed-fetch retries for queries. */
    retry: number;
    /** Exponential delay matching ApiClient GET backoff. */
    retryDelay: (attemptIndex: number) => number;
  };
  mutations: {
    /** Mutations are not retried by default — side effects must stay explicit. */
    retry: number;
  };
}

/**
 * Factory for TanStack `QueryClient` `defaultOptions`.
 *
 * @returns Plain defaults object — no Angular providers, no TanStack imports.
 *
 * @example
 * ```ts
 * // app.config.ts — pin exact experimental version in package.json
 * import {
 *   provideAngularQuery,
 *   QueryClient,
 * } from '@tanstack/angular-query-experimental';
 * import { createAfricaniesQueryClientDefaults } from '@africanies/africanies-core';
 *
 * const queryClient = new QueryClient({
 *   defaultOptions: createAfricaniesQueryClientDefaults(),
 * });
 *
 * export const appConfig = {
 *   providers: [provideAngularQuery(queryClient)],
 * };
 * ```
 *
 * @example
 * ```ts
 * // Map injectQuery() signals → AsyncQueryStateModel for <africanies-async-state>
 * import type { AsyncQueryStateModel } from '@africanies/africanies-models';
 * import { injectQuery } from '@tanstack/angular-query-experimental';
 *
 * const query = injectQuery(() => ({
 *   queryKey: ['shipments'],
 *   queryFn: () => firstValueFrom(api.getResource<Shipment>('shipments', null)),
 * }));
 *
 * const state: AsyncQueryStateModel<Shipment[] | null> = {
 *   data: query.data()?.data ?? undefined,
 *   isLoading: query.isLoading(),
 *   isFetching: query.isFetching(),
 *   isError: query.isError(),
 *   error: query.error()?.message ?? null,
 * };
 * ```
 */
export function createAfricaniesQueryClientDefaults(): AfricaniesQueryClientDefaults {
  return {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 3,
      // attemptIndex is 0-based in TanStack; match 1s, 2s, 4s style backoff.
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: 0,
    },
  };
}

/**
 * Alias of {@link createAfricaniesQueryClientDefaults} for apps that prefer a
 * `provide*` naming style beside {@link provideAfricaniesSdk}.
 *
 * Returns a plain object (not `EnvironmentProviders`) so it can be passed
 * straight into `new QueryClient({ defaultOptions: ... })`.
 *
 * @returns Same object as {@link createAfricaniesQueryClientDefaults}.
 *
 * @example
 * ```ts
 * const queryClient = new QueryClient({
 *   defaultOptions: provideAfricaniesQueryDefaults(),
 * });
 * ```
 */
export function provideAfricaniesQueryDefaults(): AfricaniesQueryClientDefaults {
  return createAfricaniesQueryClientDefaults();
}
