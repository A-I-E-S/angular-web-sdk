/**
 * Playground Tailwind config.
 *
 * Content paths are relative to this file. The workspace PostCSS config
 * (`postcss.config.js` at repo root) points Angular's builder here.
 *
 * @type {import('tailwindcss').Config}
 */
const { createRequire } = require('node:module');
const path = require('node:path');

// Resolve preset from the theme package root (same entry as @aies/aies-theme/tailwind-preset).
const themeRequire = createRequire(
  path.join(__dirname, '../../libs/aies-theme/package.json'),
);

module.exports = {
  presets: [themeRequire('@aies/aies-theme/tailwind-preset')],
  content: [
    path.join(__dirname, 'src/**/*.{html,ts}'),
    path.join(__dirname, '../../libs/aies-ui/src/**/*.{html,ts}'),
    path.join(__dirname, '../../libs/aies-theme/src/**/*.{html,ts}'),
  ],
};
