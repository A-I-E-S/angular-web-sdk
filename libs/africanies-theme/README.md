# @africanies/africanies-theme

AFRICANIES design tokens (Tailwind preset), light/dark {@link ThemeService}, and shipping-mode accent helpers ({@link ModeColorService}).

## Install

```bash
npm install @africanies/africanies-theme @africanies/africanies-storage @africanies/africanies-core
```

## Tailwind

```js
// tailwind.config.js
module.exports = {
  presets: [require('@africanies/africanies-theme/tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@africanies/africanies-ui/**/*.{js,mjs}',
  ],
};
```

> The preset file is published as `tailwind-preset.cjs` (package is ESM) but resolved via the `./tailwind-preset` export above.

See [THEME.md](./THEME.md) for the full palette, provisional typography scale, and legacy `$border-gray` mapping notes.

## ThemeService

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { ThemeService } from '@africanies/africanies-theme';

provideAppInitializer(() => {
  inject(ThemeService);
});
```

## ModeColorService

```ts
const modeColor = inject(ModeColorService);
const { text, bg, bgSubtle } = modeColor.classes();
```

Class strings are literals so Tailwind does not purge them.
