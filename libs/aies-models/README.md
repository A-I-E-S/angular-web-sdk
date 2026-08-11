# @aies/aies-models

Shared TypeScript models for the AIES Web SDK. Pure types only — no Angular
runtime dependency — so the package can be consumed from Angular apps and
non-Angular TypeScript tooling alike.

## Domains

- **api** — `ApiResponseModel`, pagination, resource id conventions
- **mode** — region/currency/unit config for STN and SFN
- **shipping** — `ShippingMode` (`'stn' | 'sfn'`)
- **async** — `AsyncQueryState` for UI async wrappers

## Usage

```ts
import type {
  ApiResponseModel,
  ModeConfigData,
  ShippingMode,
} from '@aies/aies-models';
```

## Tests

Run `nx test aies-models` (type-only library; specs optional).
