# @africanies/africanies-core

API and app-wiring layer for the AFRICANIES Web SDK: SDK config, HTTP client,
shipping mode, mode-region metadata, TanStack Query default helpers, and
route-driven overlay registration.

## Install peers

```bash
# Published from GitHub Packages (@africanies scope)
npm install @africanies/africanies-core @africanies/africanies-models @africanies/africanies-storage
```

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/router`,
`rxjs`, `@africanies/africanies-models`, `@africanies/africanies-storage`.

## Quick start

```ts
import { ApplicationConfig } from '@angular/core';
import {
  provideAfricaniesSdk,
  provideAfricaniesHttpClient,
  provideOverlayRoutes,
  createAfricaniesQueryClientDefaults,
} from '@africanies/africanies-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAfricaniesSdk({ baseUrl: 'https://api.example.com', timeout: 30_000 }),
    provideAfricaniesHttpClient(),
    // optional extras:
    // provideAfricaniesHttpClient({ interceptors: [correlationInterceptor] }),
    // optional: provideOverlayRoutes([{ paramKey: 'modal', routes: { ... } }]),
  ],
};

// TanStack Query (app dependency — pin exact experimental version):
// new QueryClient({ defaultOptions: createAfricaniesQueryClientDefaults() })
```

## Modules

| Area | Exports |
|------|---------|
| Config | `provideAfricaniesSdk`, `AFRICANIES_SDK_CONFIG`, `httpToasts` (`'off'` \| `'errors'` \| `'all'`) |
| Auth | `AuthService` (`forgot`), `isValidEmail`, `AuthTokenService` (`set` / `clear` / `get`) |
| Shipping | `ShippingModeService` (tab-scoped via `sessionStorage`), `shipmentModeInterceptor`, per-request `ApiRequestOptions.shippingMode` / `withShippingMode` |
| HTTP | `provideAfricaniesHttpClient`, `ApiClient` (auto-tags `withToast` from config / `ApiRequestOptions.toast`; optional `shippingMode` per call; HTTP failures → `Error` with formatted `.message`), `withToast`, `withShippingMode`, `httpToastInterceptor`, `normalize` (lifts Laravel validation bags into `errors` + joined `message`), `formatApiErrorMessage` (used internally; rare for hosts), `fieldErrorsMap`, `authInterceptor` |
| Query | `createAfricaniesQueryClientDefaults`, `provideAfricaniesQueryDefaults`, `listFetchKind` (body loader on first load / STN↔SFN; keep rows on focus / Refresh / pager) |
| Mode | `ModeConfigService`, `provideModeConfig`, `MODE_CONFIG_PATH` |
| Country | `CountryService`, `countryFlagUrl` / `mapCountrySelectOptions` (flagcdn.com), `COUNTRY_READ_PATH`, mappers |
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
| Browser | `copyToClipboard`, `downloadCsv` / `csvCell` (UTF-8 CSV download) |

List-style GETs follow `ResourceId`: `null` (paginated), `'all'` (full dump), `number` (single).

| Filter `optionsSource` | SDK resolver |
|------------------------|--------------|
| `warehouses` | Lazy `FilterOptionsResolver.resolveField` → `WarehouseService.readAll()` |
| `shipmentMethods` | Lazy `FilterOptionsResolver.resolveField` → `ShipmentMethodService.readAll()` |
| `shipmentManifests` | Host `optionLists` (no built-in service yet) |

`MODAL_SERVICE` / `DRAWER_SERVICE` are tokens only — implementations ship in
`@africanies/africanies-ui` to avoid circular dependencies.

## Build / test

```bash
npx nx build africanies-core
npx nx test africanies-core
```
