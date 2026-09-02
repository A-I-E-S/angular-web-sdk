/**
 * Shared Tailwind preset for AFRICANIES product UIs.
 *
 * WHY a preset (not only CSS variables): consuming apps and `@africanies/africanies-ui`
 * already use Tailwind utility classes. Shipping the palette as a preset keeps
 * class names (`text-export`, `bg-import-subtle`, …) consistent and scannable
 * by Tailwind's content detection across packages.
 *
 * Shipped as `.cjs` because ng-packagr publishes this package with
 * `"type": "module"` — a `.js` CommonJS file would break
 * `require('@africanies/africanies-theme/tailwind-preset')`.
 *
 * Consumer setup (see THEME.md):
 *   presets: [require('@africanies/africanies-theme/tailwind-preset')]
 *   content: app sources + ./node_modules/@africanies/africanies-ui (js/mjs)
 *
 * Also injects base autofill overrides so Chrome/Safari do not paint a
 * yellow/blue fill over AFRICANIES form shells (`bg-white` / `dark:bg-ink-950`),
 * and a pointer cursor on interactive controls.
 *
 * @type {import('tailwindcss').Config}
 */

/**
 * Pointer cursor on clickable controls.
 *
 * WHY base CSS (not only `cursor-pointer` utilities): browsers use
 * `cursor: default` on `button`, and Tailwind v4 content detection often
 * skips pnpm-linked `@africanies/africanies-ui` bundles so the utility is never emitted.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function africaniesInteractiveCursorPlugin({ addBase }) {
  addBase({
    [[
      'a[href]',
      'button:not(:disabled):not([aria-disabled="true"])',
      'summary',
      'label[for]',
      'select:not(:disabled)',
      'input[type="button"]:not(:disabled)',
      'input[type="submit"]:not(:disabled)',
      'input[type="reset"]:not(:disabled)',
      'input[type="checkbox"]:not(:disabled)',
      'input[type="radio"]:not(:disabled)',
      'input[type="file"]:not(:disabled)',
      '[role="button"]:not([aria-disabled="true"])',
      '[role="link"]:not([aria-disabled="true"])',
      '[role="menuitem"]:not([aria-disabled="true"])',
      '[role="option"]:not([aria-disabled="true"])',
      '[role="tab"]:not([aria-disabled="true"])',
      '[role="checkbox"]:not([aria-disabled="true"])',
      '[role="radio"]:not([aria-disabled="true"])',
      '[role="switch"]:not([aria-disabled="true"])',
    ].join(', ')]: {
      cursor: 'pointer',
    },
    ':disabled, [aria-disabled="true"]': {
      cursor: 'not-allowed',
    },
  });
}

/**
 * Neutralize browser autofill chrome so fields keep AFRICANIES tokens.
 *
 * WHY inset box-shadow (not `background-color`): WebKit ignores background
 * on `:-webkit-autofill`. A large inset shadow matches the field shell
 * (`white` / `ink-950`) and `-webkit-text-fill-color` keeps body text on
 * `ink` / white. `.dark` matches `ThemeService` (`class` on `<html>`).
 *
 * WHY one selector per `addBase` key: joining autofill selectors with commas
 * under a single `.dark ${list}` key only scopes the first selector — the rest
 * leak into light mode. WHY no `color` in the long transition: delaying color
 * freezes text when the user toggles light/dark.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function africaniesAutofillPlugin({ addBase }) {
  const autofillSelectors = [
    'input:-webkit-autofill',
    'input:-webkit-autofill:hover',
    'input:-webkit-autofill:focus',
    'input:-webkit-autofill:active',
    'textarea:-webkit-autofill',
    'textarea:-webkit-autofill:hover',
    'textarea:-webkit-autofill:focus',
    'textarea:-webkit-autofill:active',
  ];

  /** @type {Record<string, Record<string, string>>} */
  const rules = {};
  for (const selector of autofillSelectors) {
    rules[selector] = {
      WebkitTextFillColor: '#1c2b3f',
      caretColor: '#1c2b3f',
      boxShadow: '0 0 0 1000px #ffffff inset',
      transition: 'background-color 99999s ease-in-out 0s',
    };
    rules[`.dark ${selector}`] = {
      WebkitTextFillColor: '#ffffff',
      caretColor: '#ffffff',
      boxShadow: '0 0 0 1000px #272729 inset',
    };
  }
  addBase(rules);
}

/**
 * Always emit spinner motion.
 *
 * WHY: Tailwind v4 content detection often skips pnpm-linked `@africanies/africanies-ui`
 * bundles, so `animate-spin` on button loading never lands in consumer CSS.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function africaniesSpinPlugin({ addBase }) {
  addBase({
    '@keyframes africanies-spin': {
      to: { transform: 'rotate(360deg)' },
    },
    '.animate-spin': {
      animation: 'africanies-spin 1s linear infinite',
    },
  });
}

/**
 * Keep toasts above dialogs, drawers, and other CDK overlays.
 *
 * WHY: CDK sets `z-index: 1000` on overlay wrappers, panes, and backdrops.
 * This covers overlays outside the popover top layer; inside it, ToastService
 * re-shows the toast popover to stay in front.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function africaniesOverlayStackPlugin({ addBase }) {
  addBase({
    '.cdk-global-overlay-wrapper.africanies-toast-overlay, .cdk-overlay-pane.africanies-toast-panel':
      {
        zIndex: '1100',
      },
  });
}

/**
 * Keep overlay scrollbars off close buttons and other end-aligned chrome.
 *
 * WHY: modal/drawer panes used to scroll themselves. Overlay (and some
 * classic) scrollbars paint in the padding box and cover a top-right close
 * control. The pane stays `overflow: hidden`; the hosted component scrolls
 * with `scrollbar-gutter: stable` so the track is reserved even before
 * content overflows. Dialogs that split header/body can set `overflow-hidden`
 * on the host (a utility, so it wins this base rule) and put
 * `.africanies-overlay-scroll` on the body.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function africaniesOverlayScrollPlugin({ addBase }) {
  addBase({
    '.africanies-modal-panel, .africanies-drawer-panel': {
      overflow: 'hidden',
      overscrollBehavior: 'contain',
    },
    '.africanies-modal-panel > *, .africanies-drawer-panel > *': {
      minHeight: 0,
      overflowX: 'hidden',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      scrollbarGutter: 'stable',
    },
    '.africanies-drawer-panel > *': {
      height: '100%',
    },
    '.africanies-overlay-scroll': {
      overscrollBehavior: 'contain',
      scrollbarGutter: 'stable',
    },
  });
}

module.exports = {
  darkMode: 'class',
  plugins: [
    africaniesInteractiveCursorPlugin,
    africaniesSpinPlugin,
    africaniesOverlayStackPlugin,
    africaniesOverlayScrollPlugin,
    africaniesAutofillPlugin,
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        ink: {
          // Portal `.txt-primary` navy — primary body / heading text (light).
          DEFAULT: '#1c2b3f',
          blue: '#192a3e',
          brand: '#1c2b3f',
          // Previous ink DEFAULT — dark elevated cards / panels (`dark:bg-ink-surface`).
          surface: '#212529',
          950: '#272729',
        },
        neutral: {
          300: '#c9d5e1',
          400: '#a9b5cb',
          600: '#667185',
        },
        border: {
          // Soft hairline on white (portal `$border-bottom-gray`).
          DEFAULT: '#f0f2f5',
          // Nav pins / stronger chrome dividers.
          strong: '#e0e6f0',
        },
        background: {
          // Portal page shell (`container-wrap`).
          chrome: '#f6f7f9',
          // Nested wells inside white cards.
          well: '#f3f3f3',
          // Auth / welcome / soft hover.
          welcome: '#f9fafb',
        },
        export: {
          DEFAULT: '#1cbd5d',
          light: '#24dc6d',
          subtle: '#e4fff3',
          tint: '#f2fff8',
        },
        import: {
          DEFAULT: '#f08829',
          light: '#ffa95b',
          subtle: '#fffcef',
        },
        danger: {
          DEFAULT: '#ff001c',
          dark: '#b41433',
          strong: '#C00B19',
          subtle: '#FFF2F2',
        },
        warning: {
          DEFAULT: '#DBB316',
          dark: '#EF8833',
          subtle: '#FFF6E6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // PROVISIONAL — see THEME.md; sizes may tighten after design QA.
        'heading-1': ['2.5rem', { lineHeight: 1.2, fontWeight: 700 }],
        'heading-2': ['2rem', { lineHeight: 1.25, fontWeight: 700 }],
        'heading-3': ['1.5rem', { lineHeight: 1.3, fontWeight: 600 }],
        'body-lg': ['1.125rem', { lineHeight: 1.5, fontWeight: 400 }],
        body: ['1rem', { lineHeight: 1.5, fontWeight: 400 }],
        'body-sm': ['0.875rem', { lineHeight: 1.4, fontWeight: 400 }],
        caption: ['0.75rem', { lineHeight: 1.3, fontWeight: 400 }],
      },
    },
  },
};
