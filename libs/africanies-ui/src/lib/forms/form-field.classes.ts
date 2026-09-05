/**
 * Shared Tailwind class fragments for africanies-ui form controls.
 *
 * WHY string literals (not dynamic concatenation of token names): the theme
 * scanner must see full utility names in this package so they survive purge
 * when consumers scan the published UI bundle.
 */

/**
 * Inset focus ring — stays inside the control border box.
 *
 * Prefer this over `outline` + `outline-offset`. Those paint *outside* the box
 * and are clipped by `overflow: hidden|clip|auto` ancestors (modals, drawers,
 * steppers, scroll panes). `box-sizing` does not affect outlines.
 */
export const FORM_FOCUS_WITHIN_CLASS =
  'focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-focus';

/** Same inset ring for host / button-style focus-visible. */
export const FORM_FOCUS_VISIBLE_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus';

/** Peer-driven inset ring (checkbox / radio control chrome). */
export const FORM_FOCUS_VISIBLE_PEER_CLASS =
  'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-focus';

/** Direct focus (OTP cells and similar). */
export const FORM_FOCUS_CLASS =
  'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus';

/** Label above the control. Hidden when empty so callers can omit a label. */
export const FORM_LABEL_CLASS =
  'block text-body-sm font-medium text-ink dark:text-white mb-1.5 empty:hidden';

/**
 * Default control shell — `h-10` matches md `africanies-button`.
 *
 * Focus utilities are inlined (not concatenated) so Tailwind content scanning
 * always sees the full class names in this string literal.
 */
export const FORM_FIELD_CLASS =
  'flex items-center w-full h-10 box-border rounded-control border border-control bg-surface dark:bg-ink-950 text-ink dark:text-white dark:border-white/25 ' +
  'focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-focus';

/**
 * Error border — `!` so it wins over shell `border-border` /
 * `dark:border-white/25` (same specificity; those utilities sort later in the
 * generated CSS and otherwise paint over `border-danger`).
 *
 * Keep these literals static for Tailwind content scanning in consumer apps.
 */
export const FORM_FIELD_ERROR_CLASS =
  '!border-danger-dark dark:!border-danger focus-within:!ring-danger-dark focus:!ring-danger-dark';

/** Native input / textarea inside a shell. */
export const FORM_CONTROL_INNER_CLASS =
  'flex-1 min-w-0 min-h-0 h-full w-full bg-transparent border-0 outline-none text-body text-ink dark:text-white px-3 py-0 ' +
  'placeholder:text-neutral-500 disabled:cursor-not-allowed';

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
export const FORM_ERROR_CLASS = 'mt-1.5 text-caption text-danger-dark m-0';

/** Disabled shell — dimmed with not-allowed cursor over the full field chrome. */
export const FORM_DISABLED_CLASS = 'opacity-50 cursor-not-allowed';
