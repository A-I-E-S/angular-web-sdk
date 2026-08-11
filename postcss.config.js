/**
 * Workspace PostCSS config used by the Angular application builder.
 * Points at the playground Tailwind config (preset + content globs).
 */
module.exports = {
  plugins: {
    tailwindcss: {
      config: './apps/playground/tailwind.config.js',
    },
    autoprefixer: {},
  },
};
