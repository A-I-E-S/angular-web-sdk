# @africanies/angular-web-sdk

Private Angular SDK for AFRICANIES product UIs. Six independently versioned packages
under the `@africanies` scope, published to [npm](https://www.npmjs.com/org/africanies). Workspace package:
**@africanies/angular-web-sdk**.

## Packages

| Package | Role |
| --- | --- |
| [`@africanies/africanies-models`](./libs/africanies-models) | Shared `*Model` domain types (API envelope, countries, mode config, filters, async state) — no Angular runtime |
| [`@africanies/africanies-storage`](./libs/africanies-storage) | `StorageService` + local/session providers (theme uses local; shipping mode uses session per tab) |
| [`@africanies/africanies-core`](./libs/africanies-core) | `provideAfricaniesSdk`, HTTP client, interceptors, shipping mode, overlay route wiring |
| [`@africanies/africanies-theme`](./libs/africanies-theme) | Tailwind preset, `ThemeService`, `ModeColorService` |
| [`@africanies/africanies-icons`](./libs/africanies-icons) | SVG sprite + typed `IconName` / `ICON_NAMES` + `<africanies-icon>` |
| [`@africanies/africanies-ui`](./libs/africanies-ui) | Buttons, feedback, forms, table, pagination, stepper, overlays |

## Install (consuming app)

Install what you need from the public npm registry (no custom `.npmrc` required):

```bash
npm install @africanies/africanies-core @africanies/africanies-models @africanies/africanies-storage \
  @africanies/africanies-theme @africanies/africanies-icons @africanies/africanies-ui
```

### Migrating from `@aies/*`

If a consuming app still references the old scope, update in one pass:

| Before | After |
| --- | --- |
| GitHub Packages `.npmrc` lines | Remove — packages install from npmjs.org |
| `@aies/aies-core` (etc.) | `@africanies/africanies-core` (etc.) |
| `provideAiesSdk` | `provideAfricaniesSdk` |
| `provideAiesHttpClient` | `provideAfricaniesHttpClient` |
| `provideAiesUiOverlays` | `provideAfricaniesUiOverlays` |
| `provideAiesToasts` | `provideAfricaniesToasts` |
| `<aies-button>` / `aiesCellDef` | `<africanies-button>` / `africaniesCellDef` |
| Storage keys `aies.theme`, `aies.accessToken`, … | `africanies.theme`, `africanies.accessToken`, … |

Publish current versions from this repo to npm (`nx release publish`; see [CONTRIBUTING](./CONTRIBUTING.md)) before pointing production apps at the new names.

## Quickstart

Wire these in `app.config.ts`. Each provider turns on one slice of the SDK:

| Provider / setup | What it does |
| --- | --- |
| `provideAfricaniesSdk({ baseUrl })` | **Required.** Sets the API base URL (and optional timeout/headers) used by all SDK HTTP services. |
| `provideAfricaniesHttpClient()` | **Required for API calls.** Registers Angular `HttpClient` plus SDK interceptors: shipping mode header, bearer token from `AuthTokenService`, and optional HTTP toasts. |
| `provideAfricaniesUiOverlays()` | Enables modal / drawer / confirm overlay services used by UI components (filters, dialogs, etc.). |
| `provideAfricaniesToasts()` | **Optional.** Mounts the toast UI and connects it to HTTP. Then mark individual requests with `withToast()` to show success/error toasts. Without this, `withToast()` is a no-op. |
| `inject(ThemeService)` in an app initializer | Applies light/dark theme class early so the first paint matches the stored preference. |
| `AuthTokenService.set(access_token)` | **After login** (in your app code, not usually in `app.config`). Saves the token so SDK requests send `Authorization: Bearer …`. On logout, call `UserService.logoutFromAllSessions()` while the token is still set, then `.clear()`. Use `AuthService.forgot(email)` for the email-only reset-link POST. If `user.default_password`, send the user to change password via `UserService.changePassword`. |

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import {
  provideAfricaniesSdk,
  provideAfricaniesHttpClient,
} from '@africanies/africanies-core';
import { provideAfricaniesUiOverlays, provideAfricaniesToasts } from '@africanies/africanies-ui';
import { ThemeService } from '@africanies/africanies-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1) Where API calls go
    provideAfricaniesSdk({ baseUrl: 'https://api.example.com' }),

    // 2) HttpClient + SDK interceptors (mode, auth token, toast hook)
    provideAfricaniesHttpClient(),

    // 3) Modal / drawer / confirm overlays
    provideAfricaniesUiOverlays(),

    // 4) Toast stack + HTTP → toast bridge (use withToast() per request)
    provideAfricaniesToasts(),

    // 5) Apply saved light/dark theme before first render
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};

// After your app's login/register succeeds:
// inject(AuthTokenService).set(access_token);
//
// Then SDK calls like UserService.me() are authenticated automatically.
// On logout: UserService.logoutFromAllSessions() then AuthTokenService.clear().
```

```js
// tailwind.config.js — preset ships as .cjs (ESM package)
module.exports = {
  presets: [require('@africanies/africanies-theme/tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@africanies/africanies-ui/**/*.{js,mjs}',
  ],
};
```

Serve the icon sprite from `node_modules/@africanies/africanies-icons/assets/icons.sprite.svg`
(see `@africanies/africanies-icons` README). Theme details: [`libs/africanies-theme/THEME.md`](./libs/africanies-theme/THEME.md).

## Playground

Local catalog of the components and tokens:

```bash
pnpm dev
# or: pnpm exec nx serve playground
```

## Docs

- [Contributing & release](./CONTRIBUTING.md)
- Per-library READMEs under `libs/africanies-*` (playground at `pnpm dev` for live examples)

## Workspace scripts

```bash
pnpm build             # build the six libraries
pnpm test
pnpm lint
pnpm audit             # dependency audit (see Security below)
pnpm icons:build       # regenerate sprite + ICON_NAMES
pnpm docs:coverage
```

## Security

`pnpm audit` is part of local/CI checks. Known exceptions live in
[`pnpm-workspace.yaml`](./pnpm-workspace.yaml):

| Issue | Mitigation |
| --- | --- |
| `brace-expansion` DoS (via Nx) | `overrides` pin `>=5.0.9` |
| `image-size` DoS (via `@nx/webpack` → `less`) | Ignored until `image-size@2.0.3` is published or Nx allows `less@4.8+` (dev/build tooling only; not shipped in `@africanies/*` packages) |

Re-run `pnpm audit` after Nx or lockfile updates and drop ignores once upstream fixes land.

## Contributors

- [Ikechukwu](https://github.com/ikechukwukalu)
- [Chinedu](https://github.com/SirG97)
- [Armstrong](https://github.com/enginemoves)
- [Adebowale](https://github.com/Princedebo01)
- [Muhydeen](https://github.com/muhydeen95)
- [Dotun](https://github.com/d8zzy)
- [Busola](https://github.com/codearemo)
