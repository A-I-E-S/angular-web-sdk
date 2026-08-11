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
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
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
