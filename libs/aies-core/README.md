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
| Shipping | `ShippingModeService`, `shipmentModeInterceptor` |
| HTTP | `provideAiesHttpClient`, `ApiClient`, `withToast`, `httpToastInterceptor`, `normalize`, `authInterceptor` |
| Query | `createAiesQueryClientDefaults`, `provideAiesQueryDefaults` |
| Mode | `ModeConfigService`, `provideModeConfig`, `MODE_CONFIG_PATH` |
| Country | `CountryService`, `COUNTRY_READ_PATH`, `mapCountry` / `mapCountryList` |
| Shipment method | `ShipmentMethodService`, `SHIPMENT_METHOD_READ_PATH`, `mapShipmentMethod` / `mapShipmentMethodList` |
| Warehouse | `WarehouseService`, `WAREHOUSE_READ_PATH`, `mapWarehouse` / `mapWarehouseList` |
| Zone | `ZoneService`, `ZONE_READ_PATH`, `mapZone` / `mapZoneList` |
| User | `UserService`, `USER_PATH`, `mapUser` (bare `/user` body) |
| Overlay | `provideOverlayRoutes`, `RouteOverlayService`, `MODAL_SERVICE`, `DRAWER_SERVICE` |
| Browser | `copyToClipboard` |

`MODAL_SERVICE` / `DRAWER_SERVICE` are tokens only — implementations ship in
`@aies/aies-ui` to avoid circular dependencies.

## Build / test

```bash
npx nx build aies-core
npx nx test aies-core
```
