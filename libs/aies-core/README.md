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
| Config | `provideAiesSdk`, `AIES_SDK_CONFIG`, `httpToasts` (`'off'` \| `'errors'` \| `'all'`) |
| Auth | `AuthService` (`forgot`), `isValidEmail`, `AuthTokenService` (`set` / `clear` / `get`) |
| Shipping | `ShippingModeService` (tab-scoped via `sessionStorage`), `shipmentModeInterceptor` |
| HTTP | `provideAiesHttpClient`, `ApiClient` (auto-tags `withToast` from config / `ApiRequestOptions.toast`; HTTP failures → `Error` with formatted `.message`), `withToast`, `httpToastInterceptor`, `normalize` (lifts Laravel validation bags into `errors` + joined `message`), `formatApiErrorMessage` (used internally; rare for hosts), `fieldErrorsMap`, `authInterceptor` |
| Query | `createAiesQueryClientDefaults`, `provideAiesQueryDefaults` |
| Mode | `ModeConfigService`, `provideModeConfig`, `MODE_CONFIG_PATH` |
| Country | `CountryService` (`readPage` / `readAll` / `readById`), `COUNTRY_READ_PATH`, `mapCountry` / `mapCountryList` |
| Service | `ServiceService` (`readPage` / `readAll` / `readById`), `SERVICE_READ_PATH` (`/public/service/read`), mappers |
| Document | `DocumentService` (`readPage` / `readAll` / `readById`), `DOCUMENT_READ_PATH` (`/public/document/read`) — preview via `file_ref` on by-id |
| Plan | `PlanService` (`readPage` / `readAll` / `readById`), `PLAN_READ_PATH` (`/public/plan/read`), mappers |
| Currency | `CurrencyService` (`readPage` / `readAll` / `readById`, `create` / `update` / `remove`), `CURRENCY_*_PATH`, mappers |
| Payment method | `PaymentMethodService` (`readPage` / `readAll` / `readById`, `update`), `PAYMENT_METHOD_READ_PATH` / `PAYMENT_METHOD_UPDATE_PATH`, mappers |
| Shipment method | `ShipmentMethodService` (`readPage` / `readAll` / `readById`), `SHIPMENT_METHOD_READ_PATH`, mappers |
| Warehouse | `WarehouseService` (`readPage` / `readAll` / `readById`), `WAREHOUSE_READ_PATH`, mappers |
| Zone | `ZoneService` (`readPage` / `readAll` / `readById`), `ZONE_READ_PATH`, mappers |
| Product | `ProductService` (`readPage` / `readAll` / `readById`), `PRODUCT_READ_PATH`, mappers |
| User | `UserService` (`me`, `changePassword`, `logoutFromAllSessions`), `USER_PATH`, `mapUser` (bare `/user` body; needs `AuthTokenService.set`) |
| Notification | `NotificationService` (`readPage` / `readAll` / `readOne`), `NOTIFICATION_READ_PATH`, `mapNotification` / `mapNotificationInboxItem` |
| File | `FileService` (`read` / `readMultiple` → `POST /file/read`), `FILE_READ_PATH`, `mapFileRead` / `mapFileReadList` |
| Overlay | `provideOverlayRoutes`, `RouteOverlayService`, `MODAL_SERVICE`, `DRAWER_SERVICE` |
| Filters | `FilterOptionsResolver` (`resolveField` lazy in drawer), `mergeFilterOptionLists`, warehouse/method mappers |
| Browser | `copyToClipboard` |

List-style GETs follow `ResourceId`: `null` (paginated), `'all'` (full dump), `number` (single).

| Filter `optionsSource` | SDK resolver |
|------------------------|--------------|
| `warehouses` | Lazy `FilterOptionsResolver.resolveField` → `WarehouseService.readAll()` |
| `shipmentMethods` | Lazy `FilterOptionsResolver.resolveField` → `ShipmentMethodService.readAll()` |
| `shipmentManifests` | Host `optionLists` (no built-in service yet) |

`MODAL_SERVICE` / `DRAWER_SERVICE` are tokens only — implementations ship in
`@aies/aies-ui` to avoid circular dependencies.

## Build / test

```bash
npx nx build aies-core
npx nx test aies-core
```
