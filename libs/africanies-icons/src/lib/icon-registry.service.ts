import { DOCUMENT } from '@angular/common';
import {
  inject,
  Injectable,
  InjectionToken,
} from '@angular/core';

/**
 * URL of the SVG sprite served by the host application.
 *
 * Default assumes the published asset is copied to
 * `/assets/africanies-icons/icons.sprite.svg` (see package README). The leading
 * slash is required: Angular `[src]` / `fetch()` resolve relative URLs
 * against the current route (`/login/assets/…`), not `<base href="/">`.
 * Override when the host uses a CDN or a different assets path.
 */
export const AFRICANIES_ICON_SPRITE_URL = new InjectionToken<string>(
  'AFRICANIES_ICON_SPRITE_URL',
  {
    providedIn: 'root',
    factory: () => '/assets/africanies-icons/icons.sprite.svg',
  },
);

/**
 * Fetches and inlines the icon sprite once into `document.body`.
 *
 * WHY inline (not external `<use href="sprite.svg#id">`):
 * - External fragment references break under some CSP / cross-origin setups.
 * - Inlining once lets every `<africanies-icon>` use cheap `#symbol-id` hrefs and
 *   keeps a single network request for 600+ icons.
 *
 * Call {@link ensureLoaded} from `AfricaniesIconComponent` (or app bootstrap). Safe
 * to invoke repeatedly — concurrent callers share one in-flight promise.
 */
@Injectable({ providedIn: 'root' })
export class IconRegistryService {
  private readonly document = inject(DOCUMENT);
  private readonly spriteUrl = inject(AFRICANIES_ICON_SPRITE_URL);

  private loadPromise: Promise<void> | null = null;
  private loaded = false;

  /**
   * Ensures the sprite `<svg>` is present in the DOM.
   *
   * @returns Resolves when the sprite is inlined (or already present).
   * @throws {Error} When the sprite URL cannot be fetched.
   */
  ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.fetchAndInline().finally(() => {
      this.loadPromise = null;
    });
    return this.loadPromise;
  }

  /**
   * Whether the sprite has been successfully inlined.
   *
   * @returns `true` after a successful {@link ensureLoaded}.
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  private async fetchAndInline(): Promise<void> {
    if (this.document.getElementById('africanies-icon-sprite')) {
      this.loaded = true;
      return;
    }

    const response = await fetch(this.spriteUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to load AFRICANIES icon sprite from "${this.spriteUrl}" (${response.status})`,
      );
    }

    const markup = await response.text();
    const container = this.document.createElement('div');
    container.id = 'africanies-icon-sprite';
    container.setAttribute('hidden', '');
    container.setAttribute('aria-hidden', 'true');
    // WHY innerHTML: sprite is trusted first-party SVG from this package.
    container.innerHTML = markup;
    this.document.body.prepend(container);
    this.loaded = true;
  }
}
