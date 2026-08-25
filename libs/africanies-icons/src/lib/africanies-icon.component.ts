import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
} from '@angular/core';

import type { IconName } from './icon-name';
import { IconRegistryService } from './icon-registry.service';

/**
 * Renders a single icon from the shared SVG sprite.
 *
 * WHY sprite + `<use>`: one network fetch (via {@link IconRegistryService})
 * serves every icon instead of shipping hundreds of Angular components or
 * individual SVG HTTP requests.
 *
 * Host apps must serve `icons.sprite.svg` (see package README) or override
 * {@link AFRICANIES_ICON_SPRITE_URL}.
 *
 * @example
 * ```html
 * <africanies-icon name="truck" />
 * <africanies-icon name="search" [size]="32" />
 * ```
 */
@Component({
  selector: 'africanies-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="resolvedSize()"
      [attr.height]="resolvedSize()"
      [attr.aria-hidden]="true"
      focusable="false"
      part="svg"
    >
      <use [attr.href]="href()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
      vertical-align: middle;
      /* Inherit surrounding text so dark:text-white / mode accents paint the glyph. */
      color: inherit;
    }

    svg {
      display: block;
      fill: currentColor;
      color: inherit;
    }
  `,
  host: {
    '[attr.data-icon]': 'name()',
  },
})
export class AfricaniesIconComponent {
  private readonly registry = inject(IconRegistryService);

  /**
   * Icon id matching a `<symbol>` in the sprite / {@link IconName} union.
   */
  readonly name = input.required<IconName>();

  /**
   * CSS pixel size for width and height. Accepts a number (`24`) or CSS length
   * (`'1.5rem'`). Defaults to `24`.
   */
  readonly size = input<number | string>(24);

  constructor() {
    // Kick off sprite load on first icon render; failures surface as rejected
    // promises / console errors rather than blanking the whole app.
    effect(() => {
      // Track name so HMR / late registry overrides still trigger ensureLoaded.
      void this.name();
      void this.registry.ensureLoaded().catch((err: unknown) => {
        console.error('[africanies-icon] sprite load failed', err);
      });
    });
  }

  /**
   * Fragment href into the inlined sprite (`#truck`).
   *
   * @returns Hash fragment pointing at the named symbol.
   */
  protected href(): string {
    return `#${this.name()}`;
  }

  /**
   * Normalized size attribute value.
   *
   * @returns Size as a string suitable for the SVG `width`/`height` attrs.
   */
  protected resolvedSize(): string {
    const value = this.size();
    return typeof value === 'number' ? String(value) : value;
  }
}
