# @aies/aies-core

API and app-wiring layer for the AIES Web SDK: SDK config, HTTP client,
shipping mode, mode-region metadata, TanStack Query default helpers, and
route-driven overlay registration.

## Install peers

```bash
# Published from GitHub Packages (@aies scope)
npm install @aies/aies-core @aies/aies-models @aies/aies-storage
```

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/router`,
`rxjs`, `@aies/aies-models`, `@aies/aies-storage`.

## Quick start

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  provideAiesSdk,
  shipmentModeInterceptor,
  authInterceptor,
  provideOverlayRoutes,
  createAiesQueryClientDefaults,
} from '@aies/aies-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiesSdk({ baseUrl: 'https://api.example.com', timeout: 30_000 }),
    provideHttpClient(
      withInterceptors([shipmentModeInterceptor, authInterceptor]),
    ),
    // optional: provideOverlayRoutes([{ paramKey: 'modal', routes: { ... } }]),
  ],
};

// TanStack Query (app dependency — pin exact experimental version):
// new QueryClient({ defaultOptions: createAiesQueryClientDefaults() })
```

## Modules

| Area | Exports |
|------|---------|
| Config | `provideAiesSdk`, `AIES_SDK_CONFIG` |
| Shipping | `ShippingModeService`, `shipmentModeInterceptor` |
| HTTP | `ApiClient`, `normalize`, `authInterceptor`, `AUTH_TOKEN_PROVIDER` |
| Query | `createAiesQueryClientDefaults`, `provideAiesQueryDefaults` |
| Mode | `ModeConfigService`, `provideModeConfig`, `MODE_CONFIG_PATH` |
| Overlay | `provideOverlayRoutes`, `RouteOverlayService`, `MODAL_SERVICE`, `DRAWER_SERVICE` |

`MODAL_SERVICE` / `DRAWER_SERVICE` are tokens only — implementations ship in
`@aies/aies-ui` to avoid circular dependencies.

## Build / test

```bash
npx nx build aies-core
npx nx test aies-core
```
