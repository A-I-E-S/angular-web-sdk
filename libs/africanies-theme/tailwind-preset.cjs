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
          DEFAULT: '#212529',
          blue: '#192a3e',
          brand: '#1c2b3f',
          950: '#272729',
        },
        /*
         * Cool slate ramp — one hue family end to end.
         *
         * WHY the full scale is declared: `extend` merges with Tailwind's
         * defaults, so previously only 300/400/600 were cool blue-greys while
         * 50/100/200/500/700/800/900 fell through to Tailwind's *pure* greys
         * (zero saturation). Mixing two hue families is what made light mode
         * read as muddy. 300/400/600 keep their exact values because dark mode
         * renders body copy with them.
         */
        neutral: {
          50: '#f7f9fc',
          100: '#eef2f7',
          200: '#dfe6ee',
          300: '#c9d5e1',
          400: '#a9b5cb',
          500: '#8593a8',
          600: '#667185',
          700: '#4d586b',
          800: '#3a4557',
          900: '#252d3a',
        },
        /*
         * Light-mode surfaces. Dark mode keeps using `ink` / `ink-950`, which
         * already separate card from canvas by a clear step; light mode needs
         * the same treatment (white cards lifting off a tinted canvas).
         */
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f7f9fc',
          sunken: '#eef2f7',
        },
        border: {
          // Three weights so hairline dividers, card edges, and field borders
          // are no longer all the same line.
          subtle: '#e4eaf1',
          DEFAULT: '#c9d5e1',
          strong: '#a9b5cb',
        },
        background: {
          // Page canvas and subtle hover share this token. Was `#f9fafb`,
          // only ~2% off white — cards never read as cards and
          // `hover:bg-background-welcome` was invisible.
          welcome: '#f1f5f9',
        },
        /*
         * Brand accents keep their exact hex — `DEFAULT` and `light` are what
         * dark mode paints. `ink` variants are the light-mode text/icon colors:
         * `text-export` on white is only 2.5:1, well under WCAG AA.
         */
        export: {
          DEFAULT: '#1cbd5d',
          light: '#24dc6d',
          ink: '#0b7a3d', // 5.4:1 on white
          subtle: '#e6f6ed',
          tint: '#f2fff8',
        },
        import: {
          DEFAULT: '#f08829',
          light: '#ffa95b',
          ink: '#9a5410', // 5.8:1 on white
          // Was `#fffcef` — 99% white, so STN surfaces looked untinted while
          // the SFN equivalent was clearly green.
          subtle: '#fdf3e8',
        },
        danger: {
          DEFAULT: '#ff001c',
          dark: '#b41433',
          strong: '#C00B19',
          ink: '#b3121f', // 6.9:1 on white
          subtle: '#fdecec',
        },
        warning: {
          DEFAULT: '#DBB316',
          dark: '#EF8833',
          ink: '#8a6d0b', // 4.9:1 on white
          subtle: '#fdf3d9',
        },
      },
      /*
       * Cool-tinted elevation. Neutral-black shadows go grey against the
       * slate canvas; biasing the shadow toward the ink hue keeps depth clean.
       */
      boxShadow: {
        card: '0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.06)',
        raised:
          '0 4px 8px -2px rgb(16 24 40 / 0.08), 0 2px 4px -2px rgb(16 24 40 / 0.04)',
        overlay:
          '0 12px 24px -6px rgb(16 24 40 / 0.12), 0 4px 8px -4px rgb(16 24 40 / 0.06)',
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
