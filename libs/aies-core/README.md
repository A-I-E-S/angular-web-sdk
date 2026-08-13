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
import {
  provideAiesSdk,
  provideAiesHttpClient,
  provideOverlayRoutes,
  createAiesQueryClientDefaults,
} from '@aies/aies-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiesSdk({ baseUrl: 'https://api.example.com', timeout: 30_000 }),
    provideAiesHttpClient(),
    // optional extras:
    // provideAiesHttpClient({ interceptors: [correlationInterceptor] }),
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
| Auth | `AuthTokenService` (`set` / `clear` / `get`) |
| Shipping | `ShippingModeService`, `shipmentModeInterceptor` |
| HTTP | `provideAiesHttpClient`, `ApiClient` (`getResource` / `getResourcePage` / `getResourceAll` / `getResourceById`), `buildResourcePath`, `withToast`, `httpToastInterceptor`, `normalize`, `authInterceptor` |
| Query | `createAiesQueryClientDefaults`, `provideAiesQueryDefaults` |
| Mode | `ModeConfigService`, `provideModeConfig`, `MODE_CONFIG_PATH` |
| Country | `CountryService` (`readPage` / `readAll` / `readById`), `COUNTRY_READ_PATH`, `mapCountry` / `mapCountryList` |
| Shipment method | `ShipmentMethodService` (`readPage` / `readAll` / `readById`), `SHIPMENT_METHOD_READ_PATH`, mappers |
| Warehouse | `WarehouseService` (`readPage` / `readAll` / `readById`), `WAREHOUSE_READ_PATH`, mappers |
| Zone | `ZoneService` (`readPage` / `readAll` / `readById`), `ZONE_READ_PATH`, mappers |
| Product | `ProductService` (`readPage` / `readAll` / `readById`), `PRODUCT_READ_PATH`, mappers |
| User | `UserService`, `USER_PATH`, `mapUser` (bare `/user` body; needs `AuthTokenService.set`) |
| File | `FileService`, `FILE_READ_PATH`, `mapFileRead` (`data` is a single object) |
| Overlay | `provideOverlayRoutes`, `RouteOverlayService`, `MODAL_SERVICE`, `DRAWER_SERVICE` |
| Browser | `copyToClipboard` |

List-style GETs follow `ResourceId`: `null` (paginated), `'all'` (full dump), `number` (single).

`MODAL_SERVICE` / `DRAWER_SERVICE` are tokens only — implementations ship in
`@aies/aies-ui` to avoid circular dependencies.

## Build / test

```bash
npx nx build aies-core
npx nx test aies-core
```
