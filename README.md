# aies-web-sdk

Private Angular SDK for AIES product UIs. Six independently versioned packages
under the `@aies` scope, published to GitHub Packages. Workspace name:
**aies-web-sdk**.

## Packages

| Package | Role |
| --- | --- |
| [`@aies/aies-models`](./libs/aies-models) | Shared `*Model` domain types (API envelope, countries, mode config, filters, async state) — no Angular runtime |
| [`@aies/aies-storage`](./libs/aies-storage) | `StorageService` + local/session providers used by theme & shipping mode |
| [`@aies/aies-core`](./libs/aies-core) | `provideAiesSdk`, HTTP client, interceptors, shipping mode, overlay route wiring |
| [`@aies/aies-theme`](./libs/aies-theme) | Tailwind preset, `ThemeService`, `ModeColorService` |
| [`@aies/aies-icons`](./libs/aies-icons) | SVG sprite + typed `IconName` / `ICON_NAMES` + `<aies-icon>` |
| [`@aies/aies-ui`](./libs/aies-ui) | Buttons, feedback, forms, table, pagination, stepper, overlays |

## Install (consuming app)

1. Add an `.npmrc` (see [docs/consumer.npmrc.template](./docs/consumer.npmrc.template)):

```ini
@aies:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

2. Install what you need:

```bash
npm install @aies/aies-core @aies/aies-models @aies/aies-storage \
  @aies/aies-theme @aies/aies-icons @aies/aies-ui
```

## Quickstart

Wire these in `app.config.ts`. Each provider turns on one slice of the SDK:

| Provider / setup | What it does |
| --- | --- |
| `provideAiesSdk({ baseUrl })` | **Required.** Sets the API base URL (and optional timeout/headers) used by all SDK HTTP services. |
| `provideAiesHttpClient()` | **Required for API calls.** Registers Angular `HttpClient` plus SDK interceptors: shipping mode header, bearer token from `AuthTokenService`, and optional HTTP toasts. |
| `provideAiesUiOverlays()` | Enables modal / drawer / confirm overlay services used by UI components (filters, dialogs, etc.). |
| `provideAiesToasts()` | **Optional.** Mounts the toast UI and connects it to HTTP. Then mark individual requests with `withToast()` to show success/error toasts. Without this, `withToast()` is a no-op. |
| `inject(ThemeService)` in an app initializer | Applies light/dark theme class early so the first paint matches the stored preference. |
| `AuthTokenService.set(access_token)` | **After login** (in your app code, not usually in `app.config`). Saves the token so SDK requests send `Authorization: Bearer …`. On logout, call `UserService.logoutFromAllSessions()` while the token is still set, then `.clear()`. Use `AuthService.forgot(email)` for the email-only reset-link POST. If `user.default_password`, send the user to change password via `UserService.changePassword`. |

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import {
  provideAiesSdk,
  provideAiesHttpClient,
} from '@aies/aies-core';
import { provideAiesUiOverlays, provideAiesToasts } from '@aies/aies-ui';
import { ThemeService } from '@aies/aies-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1) Where API calls go
    provideAiesSdk({ baseUrl: 'https://api.example.com' }),

    // 2) HttpClient + SDK interceptors (mode, auth token, toast hook)
    provideAiesHttpClient(),

    // 3) Modal / drawer / confirm overlays
    provideAiesUiOverlays(),

    // 4) Toast stack + HTTP → toast bridge (use withToast() per request)
    provideAiesToasts(),

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
  presets: [require('@aies/aies-theme/tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@aies/aies-ui/**/*.{js,mjs}',
  ],
};
```

Serve the icon sprite from `node_modules/@aies/aies-icons/assets/icons.sprite.svg`
(see `@aies/aies-icons` README). Theme details: [`libs/aies-theme/THEME.md`](./libs/aies-theme/THEME.md).

## Playground

Local catalog of the components and tokens:

```bash
pnpm dev
# or: pnpm exec nx serve playground
```

## Docs

- [Contributing & release](./CONTRIBUTING.md)
- Per-library READMEs under `libs/aies-*` (playground at `pnpm dev` for live examples)

## Workspace scripts

```bash
pnpm build             # build the six libraries
pnpm test
pnpm lint
pnpm icons:build       # regenerate sprite + ICON_NAMES
pnpm docs:coverage
```
