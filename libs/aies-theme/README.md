# @aies/aies-theme

AIES design tokens (Tailwind preset), light/dark {@link ThemeService}, and shipping-mode accent helpers ({@link ModeColorService}).

## Install

```bash
npm install @aies/aies-theme @aies/aies-storage @aies/aies-core
```

## Tailwind

```js
// tailwind.config.js
module.exports = {
  presets: [require('@aies/aies-theme/tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    './node_modules/@aies/aies-ui/**/*.{js,mjs}',
  ],
};
```

> The preset file is published as `tailwind-preset.cjs` (package is ESM) but resolved via the `./tailwind-preset` export above.

See [THEME.md](./THEME.md) for the full palette, provisional typography scale, and legacy `$border-gray` mapping notes.

## ThemeService

```ts
import { inject, provideAppInitializer } from '@angular/core';
import { ThemeService } from '@aies/aies-theme';

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
