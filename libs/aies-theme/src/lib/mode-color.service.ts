import { computed, inject, Injectable } from '@angular/core';
import { ShippingModeService } from '@aies/aies-core';

/**
 * Tailwind class bundle for the active shipping mode (SFN export / STN import).
 *
 * Use these for **primary** product chrome: CTAs, selected controls, progress,
 * and accent text. Semantic colors (danger / warning) stay mode-independent.
 */
export interface ModeColorClasses {
  /** Text color utility, e.g. `text-export`. */
  text: string;
  /** Solid background utility, e.g. `bg-export`. */
  bg: string;
  /** Soft background utility, e.g. `bg-export-subtle`. */
  bgSubtle: string;
  /** Border matching the mode accent, e.g. `border-export`. */
  border: string;
  /**
   * Filled primary CTA — `variant="primary"` on buttons.
   * Includes hover utility as a literal so Tailwind keeps it.
   */
  primary: string;
  /**
   * Soft highlight for selected / active rows (works in dark mode).
   */
  soft: string;
  /**
   * Soft hover highlight for menus and lists.
   */
  softHover: string;
}

/**
 * Maps {@link ShippingModeService} to mode-accent Tailwind classes.
 *
 * - **SFN** → export green is primary
 * - **STN** → import orange is primary
 *
 * WHY literal class strings: Tailwind's scanner cannot see dynamically built
 * names like `` `text-${token}` ``. Returning full literals (`text-export`, …)
 * keeps utilities in the compiled CSS. See {@link MODE_COLOR_SAFELIST}.
 *
 * @example
 * ```html
 * @let colors = modeColor.classes();
 * <button type="button" [class]="colors.primary">Save</button>
 * <span [class]="colors.text">Mode accent</span>
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ModeColorService {
  private readonly shippingMode = inject(ShippingModeService);

  /**
   * Mode-dependent utility classes. Recomputes when shipping mode changes.
   */
  readonly classes = computed<ModeColorClasses>(() => {
    // Literal strings required for Tailwind content detection — do not interpolate.
    if (this.shippingMode.mode() === 'sfn') {
      return {
        text: 'text-export',
        bg: 'bg-export',
        bgSubtle: 'bg-export-subtle',
        border: 'border-export',
        primary:
          'bg-export text-white border-transparent hover:bg-export-light',
        soft: 'bg-export-subtle dark:bg-export/15',
        softHover: 'hover:bg-export-subtle dark:hover:bg-export/15',
      };
    }
    return {
      text: 'text-import',
      bg: 'bg-import',
      bgSubtle: 'bg-import-subtle',
      border: 'border-import',
      primary:
        'bg-import text-white border-transparent hover:bg-import-light',
      soft: 'bg-import-subtle dark:bg-import/15',
      softHover: 'hover:bg-import-subtle dark:hover:bg-import/15',
    };
  });
}
