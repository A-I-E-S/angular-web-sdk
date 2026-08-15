/**
 * Shared Tailwind preset for AIES product UIs.
 *
 * WHY a preset (not only CSS variables): consuming apps and `@aies/aies-ui`
 * already use Tailwind utility classes. Shipping the palette as a preset keeps
 * class names (`text-export`, `bg-import-subtle`, …) consistent and scannable
 * by Tailwind's content detection across packages.
 *
 * Shipped as `.cjs` because ng-packagr publishes this package with
 * `"type": "module"` — a `.js` CommonJS file would break
 * `require('@aies/aies-theme/tailwind-preset')`.
 *
 * Consumer setup (see THEME.md):
 *   presets: [require('@aies/aies-theme/tailwind-preset')]
 *   content: app sources + ./node_modules/@aies/aies-ui (js/mjs)
 *
 * Also injects base autofill overrides so Chrome/Safari do not paint a
 * yellow/blue fill over AIES form shells (`bg-white` / `dark:bg-ink-950`),
 * and a pointer cursor on interactive controls.
 *
 * @type {import('tailwindcss').Config}
 */

/**
 * Pointer cursor on clickable controls.
 *
 * WHY base CSS (not only `cursor-pointer` utilities): browsers use
 * `cursor: default` on `button`, and Tailwind v4 content detection often
 * skips pnpm-linked `@aies/aies-ui` bundles so the utility is never emitted.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function aiesInteractiveCursorPlugin({ addBase }) {
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
 * Neutralize browser autofill chrome so fields keep AIES tokens.
 *
 * WHY inset box-shadow (not `background-color`): WebKit ignores background
 * on `:-webkit-autofill`. A large inset shadow matches the field shell
 * (`white` / `ink-950`) and `-webkit-text-fill-color` keeps body text on
 * `ink` / white. `.dark` matches `ThemeService` (`class` on `<html>`).
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function aiesAutofillPlugin({ addBase }) {
  const autofillSelectors = [
    'input:-webkit-autofill',
    'input:-webkit-autofill:hover',
    'input:-webkit-autofill:focus',
    'input:-webkit-autofill:active',
    'textarea:-webkit-autofill',
    'textarea:-webkit-autofill:hover',
    'textarea:-webkit-autofill:focus',
    'textarea:-webkit-autofill:active',
  ].join(', ');

  addBase({
    [autofillSelectors]: {
      WebkitTextFillColor: '#212529',
      caretColor: '#212529',
      boxShadow: '0 0 0 1000px #ffffff inset',
      transition: 'background-color 99999s ease-in-out 0s',
    },
    [`.dark ${autofillSelectors}`]: {
      WebkitTextFillColor: '#ffffff',
      caretColor: '#ffffff',
      boxShadow: '0 0 0 1000px #272729 inset',
    },
  });
}

/**
 * Always emit spinner motion.
 *
 * WHY: Tailwind v4 content detection often skips pnpm-linked `@aies/aies-ui`
 * bundles, so `animate-spin` on button loading never lands in consumer CSS.
 *
 * @param {import('tailwindcss/types/config').PluginAPI} api
 */
function aiesSpinPlugin({ addBase }) {
  addBase({
    '@keyframes aies-spin': {
      to: { transform: 'rotate(360deg)' },
    },
    '.animate-spin': {
      animation: 'aies-spin 1s linear infinite',
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
function aiesOverlayStackPlugin({ addBase }) {
  addBase({
    '.cdk-global-overlay-wrapper.aies-toast-overlay, .cdk-overlay-pane.aies-toast-panel':
      {
        zIndex: '1100',
      },
  });
}

module.exports = {
  darkMode: 'class',
  plugins: [
    aiesInteractiveCursorPlugin,
    aiesSpinPlugin,
    aiesOverlayStackPlugin,
    aiesAutofillPlugin,
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        ink: {
          DEFAULT: '#212529',
          blue: '#192a3e',
          brand: '#1c2b3f',
          950: '#272729',
        },
        neutral: {
          300: '#c9d5e1',
          400: '#a9b5cb',
          600: '#667185',
        },
        border: {
          DEFAULT: '#f0f2f5',
        },
        background: {
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
        sans: ['Arial', 'sans-serif'],
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
