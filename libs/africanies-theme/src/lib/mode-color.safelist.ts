/**
 * Tailwind safelist side-effect for shipping-mode color utilities.
 *
 * WHY this file exists: JIT/content scanning only keeps class names that appear
 * as *literal strings* in scanned sources. {@link ModeColorService} already
 * returns these literals, but keeping a dedicated comment list makes the
 * contract obvious for consumers who configure `safelist` or purge plugins.
 *
 * Do not rename these strings without updating ModeColorService and THEME.md.
 *
 * SFN (export / green):
 * text-export bg-export bg-export-subtle bg-export-light border-export
 * hover:bg-export-light hover:bg-export-subtle dark:bg-export/15 dark:hover:bg-export/15
 *
 * STN (import / orange):
 * text-import bg-import bg-import-subtle bg-import-light border-import
 * hover:bg-import-light hover:bg-import-subtle dark:bg-import/15 dark:hover:bg-import/15
 */
export const MODE_COLOR_SAFELIST = [
  'text-export',
  'bg-export',
  'bg-export-subtle',
  'bg-export-light',
  'border-export',
  'hover:bg-export-light',
  'hover:bg-export-subtle',
  'dark:bg-export/15',
  'dark:hover:bg-export/15',
  'text-import',
  'bg-import',
  'bg-import-subtle',
  'bg-import-light',
  'border-import',
  'hover:bg-import-light',
  'hover:bg-import-subtle',
  'dark:bg-import/15',
  'dark:hover:bg-import/15',
] as const;
