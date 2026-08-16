# @aies/aies-models

Shared TypeScript **domain models** for the AIES Web SDK — API envelopes,
utility payloads (countries, shipment methods), shipping/mode config, filters,
and async UI snapshots. Types only: no Angular runtime, so apps and tooling can
import them safely.

## Naming

Domain interfaces use a `*Model` suffix (`CountryModel`, `ApiResponseModel`,
`ModeConfigDataModel`, `FilterStateModel`, …). Literal unions and small helper
types (e.g. `ShippingMode`, `ResourceId`, `FilterFieldType`) stay without the
suffix.

## Domains

- **api** — `ApiResponseModel`, `PaginationMetaModel`, `PaginationQueryParamsModel`, `ResourceId`, `ApiJsonValue`
- **country** — `CountryModel`, `CountryStateModel` for public country utility reads
- **currency** — `CurrencyModel`, `CurrencyPaymentMethodModel` for `/currency/read`; `CurrencyCreateRequestModel` / `CurrencyUpdateRequestModel` / `CurrencyDeleteRequestModel` for App Settings writes
- **payment-method** — `PaymentMethodModel`, `PaymentMethodCurrencyModel` for `/payment_method/read`; `PaymentMethodUpdateRequestModel` for App Settings active toggle (`PUT /payment_method/update`). No create/delete models.
- **shipment-method** — `ShipmentMethodModel`, zone link/page models for carriers
- **warehouse** — `WarehouseModel`, `WarehouseStateModel` (nested `CountryModel`)
- **zone** — `ZoneModel` for `/zone/read/records` utility reads
- **auth** — `ForgotPasswordRequestModel` for email-only `POST /auth/forgot/password`
- **user** — `UserModel` (+ nested business account / plan / subscription) for bare `GET /user` (auth); `ChangePasswordRequestModel` for first-login `POST /user/change/password`
- **notification** — `NotificationModel`, `NotificationPayloadModel`, inbox helpers for `GET /user/notifications/read/{id?}`
- **filters** — `ModuleFilterConfigModel`, `FilterStateModel`, `FilterTransport`, `toFilterParams` / `fromFilterParams` / `hasFilterParams`
- **mode** — `ModeConfigDataModel`, region/currency/unit config for STN and SFN
- **shipping** — `ShippingMode` (`'stn' | 'sfn'`)
- **async** — `AsyncQueryStateModel` for UI async wrappers

API wire models use **snake_case** field names to match server payloads. Filter/async
UI models stay camelCase.

## Usage

```ts
import type {
  ApiResponseModel,
  CountryModel,
  CurrencyModel,
  ModeConfigDataModel,
  PaymentMethodModel,
  ShipmentMethodModel,
  ShippingMode,
  WarehouseModel,
  ZoneModel,
  UserModel,
} from '@aies/aies-models';
```

## Tests

Run `nx test aies-models` (type-only library; specs optional).
