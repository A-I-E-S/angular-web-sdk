# aies-web-sdk

Private Angular SDK for AIES product UIs. Six independently versioned packages
under the `@aies` scope, published to GitHub Packages. Workspace name:
**aies-web-sdk**.

## Packages

| Package | Role |
| --- | --- |
| [`@aies/aies-models`](./libs/aies-models) | Shared TypeScript models (API envelope, shipping mode, async state) — no Angular runtime |
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

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import {
  provideAiesSdk,
  provideAiesHttpClient,
} from '@aies/aies-core';
import { provideAiesUiOverlays } from '@aies/aies-ui';
import { ThemeService } from '@aies/aies-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiesSdk({ baseUrl: 'https://api.example.com' }),
    // Ships shipment-mode + auth interceptors; pass extras if needed:
    // provideAiesHttpClient({ interceptors: [myInterceptor] })
    provideAiesHttpClient(),
    provideAiesUiOverlays(),
    provideAppInitializer(() => {
      inject(ThemeService); // applies light/dark class early
    }),
  ],
};
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

Living catalog of components, icons, tokens, and models:

```bash
npx nx serve playground
npx nx build playground
```

## Docs

- [Development prompt playbook](./docs/prompt-playbook.md)
- [Contributing & release](./CONTRIBUTING.md)
- Per-library READMEs under `libs/aies-*`

## Workspace scripts

```bash
npm run build          # build the six libraries
npm run test
npm run lint
npm run icons:build    # regenerate sprite + ICON_NAMES
npm run docs:coverage
```
