# AIES Theme

Design tokens and runtime theme helpers for `@aies/aies-theme`.

> **Needs design confirmation** — palette hex values and the provisional
> typography scale below should be reviewed against the live AIES design
> system before treating them as final. Until confirmed, treat sizes marked
> **PROVISIONAL** as subject to change.

## Tailwind setup

Consuming apps should extend this package's preset so palette/typography utilities stay aligned with `@aies/aies-ui`:

```js
// tailwind.config.js
module.exports = {
  // Shipped as .cjs so `require` works when the published package is ESM (`type: module`).
  presets: [require('@aies/aies-theme/tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    // Scan published UI bundles so mode/status utilities are not purged
    './node_modules/@aies/aies-ui/**/*.{js,mjs}',
  ],
};
```

`darkMode: 'class'` — `ThemeService` toggles the `dark` class on `document.documentElement`.

## Palette

| Token | Hex | Intended use |
| --- | --- | --- |
| `black` / `white` | `#000000` / `#ffffff` | Absolute contrast |
| `ink` / `ink-blue` / `ink-brand` / `ink-950` | `#212529` / `#192a3e` / `#1c2b3f` / `#272729` | Primary text and brand navy surfaces |
| `neutral-300/400/600` | `#c9d5e1` / `#a9b5cb` / `#667185` | Secondary text and muted chrome |
| `border` | `#f0f2f5` | Default hairline borders |
| `background-welcome` | `#f9fafb` | Welcome / empty-state canvas |
| `export` (+ light/subtle/tint) | green scale | SFN / export mode accents |
| `import` (+ light/subtle) | orange scale | STN / import mode accents |
| `danger` (+ dark/strong/subtle) | red scale | Errors and destructive actions |
| `warning` (+ dark/subtle) | amber scale | Warnings and attention |

### Legacy Sass alias mapping

In older AIES Sass, `$border-gray` and `$border-bottom-gray` both map to **`border.DEFAULT`** (`#f0f2f5`). Prefer `border-border` / `border-border` utilities (or `theme('colors.border.DEFAULT')`) instead of reintroducing separate tokens.

## Typography

`fontFamily.sans` is `Arial, sans-serif` for product consistency with existing AIES surfaces.

**PROVISIONAL** font sizes (may change after design QA):

| Token | Size | Line height | Weight |
| --- | --- | --- | --- |
| `heading-1` | 2.5rem | 1.2 | 700 |
| `heading-2` | 2rem | 1.25 | 700 |
| `heading-3` | 1.5rem | 1.3 | 600 |
| `body-lg` | 1.125rem | 1.5 | 400 |
| `body` | 1rem | 1.5 | 400 |
| `body-sm` | 0.875rem | 1.4 | 400 |
| `caption` | 0.75rem | 1.3 | 400 |

## Runtime services

### `ThemeService`

Signal-based light/dark preference. Persists via `StorageService` under `AIES_THEME_KEY`, respects `prefers-color-scheme` on first load, and applies/removes the `dark` class on `<html>`.

Inject once at bootstrap (root component or `provideAppInitializer`) so the class is applied before painted UI flashes the wrong theme.

### `ModeColorService`

Maps `ShippingModeService` (`sfn` / `stn`) to **literal** Tailwind class strings
for **primary** product chrome:

| Mode | Primary |
| --- | --- |
| `sfn` | Export green (`bg-export`, `text-export`, …) |
| `stn` | Import orange (`bg-import`, `text-import`, …) |

`ButtonComponent` `variant="primary"`, selected form controls, stepper progress,
and loading accents all read from this service. Class names must appear as
string literals in source so the Tailwind scanner keeps them — see
`mode-color.safelist.ts`.
