/**
 * Playground Tailwind config.
 *
 * Content paths are relative to this file. The workspace PostCSS config
 * (`postcss.config.js` at repo root) points Angular's builder here.
 *
 * @type {import('tailwindcss').Config}
 */
const path = require('node:path');

module.exports = {
  presets: [require('../../libs/aies-theme/tailwind-preset.cjs')],
  content: [
    path.join(__dirname, 'src/**/*.{html,ts}'),
    path.join(__dirname, '../../libs/aies-ui/src/**/*.{html,ts}'),
    path.join(__dirname, '../../libs/aies-theme/src/**/*.{html,ts}'),
  ],
};
