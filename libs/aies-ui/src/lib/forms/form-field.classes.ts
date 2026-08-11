/**
 * Shared Tailwind class fragments for aies-ui form controls.
 *
 * WHY string literals (not dynamic concatenation of token names): the theme
 * scanner must see full utility names in this package so they survive purge
 * when consumers scan the published UI bundle.
 */

/** Label above the control. */
export const FORM_LABEL_CLASS =
  'block text-body-sm font-medium text-ink dark:text-white mb-1.5';

/** Default control shell (bordered wrapper or native input). */
export const FORM_FIELD_CLASS =
  'flex items-stretch w-full min-h-10 rounded-md border border-border bg-white dark:bg-ink-950 text-ink dark:text-white dark:border-white/15 ' +
  'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ' +
  'disabled:opacity-50 disabled:pointer-events-none';

/**
 * Error border — `!` so it wins over shell `border-border` /
 * `dark:border-white/15` (same specificity; those utilities sort later in the
 * generated CSS and otherwise paint over `border-danger`).
 */
export const FORM_FIELD_ERROR_CLASS = '!border-danger dark:!border-danger';

/** Native input / textarea inside a shell. */
export const FORM_CONTROL_INNER_CLASS =
  'flex-1 min-w-0 w-full bg-transparent border-0 outline-none text-body text-ink dark:text-white px-3 py-2 ' +
  'placeholder:text-neutral-400 disabled:cursor-not-allowed';

/** Prefix / suffix projection gutters. Hidden when nothing is projected. */
export const FORM_AFFIX_CLASS =
  'inline-flex items-center shrink-0 px-2.5 text-neutral-600 dark:text-neutral-400 empty:hidden';

/**
 * Native date input extras.
 *
 * WHY no Tailwind `scheme-*`: those utilities are not emitted in this build.
 * Document `color-scheme` (ThemeService) + an inline style on the input drive
 * the native calendar chrome. Do **not** invert the indicator once
 * `color-scheme: dark` is set — invert made the glyph disappear again.
 */
export const FORM_DATE_INNER_CLASS =
  FORM_CONTROL_INNER_CLASS +
  ' cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer';

/** Hint under the control (hidden when error is shown). */
export const FORM_HINT_CLASS =
  'mt-1.5 text-caption text-neutral-600 dark:text-neutral-400 m-0';

/** Field-level validation message (not ErrorStateComponent). */
export const FORM_ERROR_CLASS = 'mt-1.5 text-caption text-danger m-0';

/** Disabled opacity applied on host wrappers that are not native disabled. */
export const FORM_DISABLED_CLASS = 'opacity-50 pointer-events-none';
