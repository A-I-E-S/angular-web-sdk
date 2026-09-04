import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { ShippingModeService } from '@africanies/africanies-core';
import type { ShippingMode } from '@africanies/africanies-models';

/**
 * Shared globe + plane glyph for STN / SFN. STN paints it rotated 180°.
 *
 * WHY inline (not the icon sprite): unique viewBox and a product-specific
 * mark, not a 24×24 kit icon.
 */
const SHIPPING_MODE_GLYPH = `M88.42,68.75a48.8,48.8,0,0,1-4.74,11.1h9.89a7.67,7.67,0,0,0,1.35.65h0a7,7,0,0,0,6.68-1l2.72-1.85a53.3,53.3,0,0,1-4.25,7.66,50.16,50.16,0,0,1-13.6,13.59,52,52,0,0,1-8.6,4.67,49.29,49.29,0,0,1-9.57,3,52.37,52.37,0,0,1-20.27,0,49,49,0,0,1-9.41-2.91l-.16-.06a52.41,52.41,0,0,1-8.6-4.67,49.81,49.81,0,0,1-7.46-6.14c-1-1-1.94-2-2.85-3.1a48.57,48.57,0,0,1,4.54-3.46q1.13,1.31,2.34,2.52h0a43.34,43.34,0,0,0,6.59,5.43,47.51,47.51,0,0,0,7.69,4.16l.13.06a42.89,42.89,0,0,0,8.3,2.55c.71.14,1.44.27,2.17.37a90.25,90.25,0,0,1-16-17.24h-8c3-1.9,6.34-3.75,9.65-5.49.25.43.51.85.78,1.27H56V69.62l1.4-.59a6.73,6.73,0,0,0,3,2.93v7.89H78.57c4.34-6.81,6.68-13.67,7-20.57l2.88,9.47ZM51.35,52.45c.68-2.17,2.57-3.91,5.31-5.67L47.3,35.84c-.63-.55-.47-1,.12-1.39l3.11-1.33a1.82,1.82,0,0,1,1.51.19l13.59,6.85,16-9.25L59.51,3.41c-.57-.63-.49-1.12.4-1.44l5-2L98.15,21.46l12-5.83c4.57-2,8.51-2.32,11-.83a2.9,2.9,0,0,1,1.78,3c.05,3-2.46,6.24-6.89,9l-12.47,4.86-1,39.53-4.46,3c-.77.55-1.22.35-1.42-.48L86.37,40l-16.64,8L67.73,63A1.85,1.85,0,0,1,67,64.38L64.17,66.2c-.65.26-1.11.14-1.2-.69l-3.76-13.9c-3,1.28-5.52,1.86-7.7,1.18-.2-.06-.22-.15-.16-.34Zm-4.2-6.93c-13.22,7-30.9,18.37-37.4,25C-11.51,92.41,5.08,109.47,29.92,102c-7.78-1.15-13.87-2.72-17.25-4.94-14.43-9.48,32-29.94,42.86-34.42l-.85-3.15a13.18,13.18,0,0,1-5.07-.53L49,58.69a6.05,6.05,0,0,1-3.55-3.51l-.13-.35a6.08,6.08,0,0,1-.07-4.26,13.1,13.1,0,0,1,2.41-4.47l-.49-.58ZM8,63.11A53.31,53.31,0,0,1,7.66,57a51.43,51.43,0,0,1,1-10.14,48.27,48.27,0,0,1,2.9-9.41l.06-.15a53.32,53.32,0,0,1,4.68-8.61,49.17,49.17,0,0,1,6.13-7.45,49.81,49.81,0,0,1,7.46-6.14,52.41,52.41,0,0,1,8.6-4.67,49.51,49.51,0,0,1,9.57-3,51.5,51.5,0,0,1,5.87-.82,9.24,9.24,0,0,0,.74,1l5.72,7.13V29.86H70.61l-5.19,3L56,28.12V14.71A104.13,104.13,0,0,0,41.56,29.86h1.33a6.85,6.85,0,0,0-2.17,3.5,5.42,5.42,0,0,0-.17.8l0,.09H38.48A51.72,51.72,0,0,0,32.74,46c-1.81,1.09-3.63,2.2-5.43,3.34a50.67,50.67,0,0,1,6-15.13H19.54a48.92,48.92,0,0,0-2.67,5.32l-.06.13A42.11,42.11,0,0,0,14.26,48a44.76,44.76,0,0,0-.82,6.82H19a130.39,130.39,0,0,0-11,8.3Zm77.51-3.9H74.7l.59-4.4h8.9l1.33,4.4ZM81,84.07a90.83,90.83,0,0,1-16,17.25c.73-.11,1.45-.24,2.17-.38a43.49,43.49,0,0,0,8.42-2.61,47.09,47.09,0,0,0,7.69-4.16,43.34,43.34,0,0,0,6.59-5.43h0A42.75,42.75,0,0,0,94,84.07ZM60.38,99.5A93.83,93.83,0,0,0,75.62,84.07H60.38V99.5ZM56,84.07H40.75A94.23,94.23,0,0,0,56,99.5V84.07ZM36.16,29.86A100.58,100.58,0,0,1,51.72,12.65c-.86.12-1.71.26-2.55.43a42,42,0,0,0-8.43,2.61,47.51,47.51,0,0,0-7.69,4.16,43.34,43.34,0,0,0-6.59,5.43h0a43.24,43.24,0,0,0-4,4.57Z`;

/**
 * Two-up shipping mode switcher for app-shell side navs.
 *
 * Reads / writes {@link ShippingModeService}. Selected **to Nigeria** uses
 * import orange; **from Nigeria** uses export green. Both tiles keep equal
 * chrome so unselected does not look like floating text.
 *
 * Project into `<africanies-side-nav>` with the `footer` attribute.
 *
 * @example
 * ```html
 * <africanies-side-nav [items]="nav" [(collapsed)]="collapsed">
 *   <africanies-shipping-mode-switch footer [collapsed]="collapsed()" />
 * </africanies-side-nav>
 * ```
 */
@Component({
  selector: 'africanies-shipping-mode-switch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
  },
  template: `
    @if (!collapsed()) {
      <p
        class="m-0 mb-2 px-1 text-caption font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400"
      >
        Shipping mode
      </p>
    }
    <div
      class="grid gap-1.5"
      [class.grid-cols-1]="collapsed()"
      [class.grid-cols-2]="!collapsed()"
      role="radiogroup"
      aria-label="Shipping mode"
    >
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="mode() === 'stn'"
        aria-label="Shipping to Nigeria"
        [class]="cardClass('stn')"
        (click)="select('stn')"
      >
        <svg
          viewBox="0 0 122.88 107.54"
          class="h-6 w-6 shrink-0 rotate-180"
          aria-hidden="true"
          focusable="false"
        >
          <path [attr.d]="glyphPath()" fill="currentColor" />
        </svg>
        @if (!collapsed()) {
          <span class="flex flex-col leading-tight">
            <span>Shipping</span>
            <span>to Nigeria</span>
          </span>
        }
      </button>
      <button
        type="button"
        role="radio"
        [attr.aria-checked]="mode() === 'sfn'"
        aria-label="Shipping from Nigeria"
        [class]="cardClass('sfn')"
        (click)="select('sfn')"
      >
        <svg
          viewBox="0 0 122.88 107.54"
          class="h-6 w-6 shrink-0"
          aria-hidden="true"
          focusable="false"
        >
          <path [attr.d]="glyphPath()" fill="currentColor" />
        </svg>
        @if (!collapsed()) {
          <span class="flex flex-col leading-tight">
            <span>Shipping</span>
            <span>from Nigeria</span>
          </span>
        }
      </button>
    </div>
  `,
})
export class ShippingModeSwitchComponent {
  private readonly shipping = inject(ShippingModeService);

  /**
   * Path data for the shared shipping-mode glyph.
   *
   * Kept as a method so ng-packagr does not inline the long SVG path into
   * the public `.d.ts` (that broke language-service parsing of this module).
   *
   * @returns SVG path `d` attribute.
   */
  protected glyphPath(): string {
    return SHIPPING_MODE_GLYPH;
  }

  /**
   * Icon-only stacked tiles when the side nav rail is collapsed.
   */
  readonly collapsed = input(false, { transform: booleanAttribute });

  /** Active mode from {@link ShippingModeService}. */
  protected readonly mode = this.shipping.mode;

  /** Host padding / divider — tighter when the rail is collapsed. */
  protected readonly hostClass = computed(() =>
    this.collapsed()
      ? 'block shrink-0 border-t border-border px-1.5 py-3 dark:border-white/10'
      : 'block shrink-0 border-t border-border px-2 py-3 dark:border-white/10',
  );

  /**
   * Requests a mode change through {@link ShippingModeService.requestModeChange}
   * so feature guards (e.g. Create Shipment confirm) can run first.
   *
   * @param next - `'stn'` (to Nigeria) or `'sfn'` (from Nigeria).
   */
  protected select(next: ShippingMode): void {
    this.shipping.requestModeChange(next).subscribe();
  }

  /**
   * Equal card chrome. Selected uses that mode’s own color so direction
   * stays visible independently of the active theme accent.
   *
   * Class names are full literals so Tailwind keeps them.
   *
   * @param option - Tile being rendered.
   * @returns Host classes for the radio card.
   */
  protected cardClass(option: ShippingMode): string {
    const selected = this.mode() === option;
    const compact = this.collapsed();
    const base =
      'flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-center text-caption font-medium transition-colors ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ' +
      (compact ? 'min-h-9 px-1 py-1.5' : 'min-h-[4.5rem] px-1.5 py-2');
    const idle =
      'border-border bg-white text-ink hover:bg-background-welcome dark:border-white/15 dark:bg-ink-950 dark:text-white dark:hover:bg-white/10';

    if (option === 'stn') {
      return selected
        ? `${base} border-import bg-import text-white`
        : `${base} ${idle}`;
    }
    return selected
      ? `${base} border-export bg-export text-white`
      : `${base} ${idle}`;
  }
}
