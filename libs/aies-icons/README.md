# @aies/aies-icons

Typed SVG icon system for AIES apps. Icons ship as a **single sprite** plus an
`IconName` union — not one Angular component per glyph.

## Why a sprite?

There are 600–1000+ icons in `/svg`. Generating a component (or HTTP request)
per file would hurt bundle size, compile time, and runtime waterfalls. The build
script packs every SVG into `icons.sprite.svg`; `IconRegistryService` fetches
that file **once** and inlines it into the DOM so `<aies-icon>` can use
`<use href="#name">`.

## Usage

```ts
import { AiesIconComponent, AIES_ICON_SPRITE_URL } from '@aies/aies-icons';

// Provide the URL where you serve the published sprite asset:
providers: [
  {
    provide: AIES_ICON_SPRITE_URL,
    useValue: 'assets/aies-icons/icons.sprite.svg',
  },
],
```

```html
<aies-icon name="truck" />
<aies-icon name="search" [size]="32" />
```

### Serving the sprite

After installing `@aies/aies-icons`, copy (or angular.json `assets` map) the
published file:

`node_modules/@aies/aies-icons/assets/icons.sprite.svg`
→ `src/assets/aies-icons/icons.sprite.svg`

Then point {@link AIES_ICON_SPRITE_URL} at that path (default already matches).

## Adding a new icon

1. Drop a new `.svg` into the monorepo `/svg` folder (kebab-case filename;
   spaces are normalized to hyphens).
2. From the repo root run:

```bash
npm run icons:build
```

3. Commit the regenerated files:
   - `libs/aies-icons/src/assets/icons.sprite.svg`
   - `libs/aies-icons/src/lib/icon-name.ts` (`ICON_NAMES` + `IconName`)

The new name appears in `ICON_NAMES` / `IconName` for autocomplete, type-checking,
and the playground gallery.

## Public API

| Export | Role |
| --- | --- |
| `ICON_NAMES` | Generated `as const` array of every icon id (for galleries / iteration) |
| `IconName` | `typeof ICON_NAMES[number]` — closed union for typed `name` inputs |
| `AiesIconComponent` | `<aies-icon name="…">` |
| `IconRegistryService` | Fetches/inlines the sprite once |
| `AIES_ICON_SPRITE_URL` | InjectionToken for the sprite URL |
