import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

import { AIES_THEME_KEY, STORAGE_TOKEN } from '@aies/aies-storage';

import type { Theme } from './theme.types';

/**
 * Application light/dark theme preference.
 *
 * WHY signals (not BehaviorSubject): theme is synchronous UI state read from
 * templates and other services; a signal avoids RxJS subscription boilerplate
 * and matches Angular 22 change detection. Persistence goes through
 * {@link STORAGE_TOKEN} so tests can swap storage without touching `localStorage`.
 *
 * Applies the Tailwind `darkMode: 'class'` contract by toggling `dark` on
 * `document.documentElement`, and sets `color-scheme` so native UI (date
 * pickers, scrollbars, form controls) matches the app theme — class-based
 * dark mode alone does not restyle browser chrome.
 *
 * @example
 * ```ts
 * // app.config.ts
 * import { inject, provideAppInitializer } from '@angular/core';
 * import { ThemeService } from '@aies/aies-theme';
 *
 * export const appConfig = {
 *   providers: [
 *     provideAppInitializer(() => {
 *       inject(ThemeService); // applies stored / system theme once
 *     }),
 *   ],
 * };
 *
 * // In a component
 * const theme = inject(ThemeService);
 * theme.toggle();
 * theme.setTheme('dark');
 * const current = theme.theme(); // 'light' | 'dark'
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(STORAGE_TOKEN);
  private readonly document = inject(DOCUMENT);

  /**
   * Current theme. Prefer reading via `theme()` in templates / computed values
   * rather than caching the string, so dark-class consumers stay in sync.
   */
  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    this.applyToDocument(this.theme());
  }

  /**
   * Sets and persists the theme, updating the `dark` class and `color-scheme`
   * on `<html>`.
   *
   * @param theme - Absolute preference to store.
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyToDocument(theme);
    try {
      this.storage.set(AIES_THEME_KEY, theme);
    } catch {
      // Persistence failure must not block the in-session visual toggle —
      // private browsing / quota issues are transient for theme preference.
    }
  }

  /**
   * Flips between light and dark.
   *
   * @returns The theme after the toggle.
   */
  toggle(): Theme {
    const next: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
    return next;
  }

  private resolveInitialTheme(): Theme {
    try {
      const stored = this.storage.get<Theme>(AIES_THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Fall through to system preference when storage is unavailable.
    }
    return this.prefersDark() ? 'dark' : 'light';
  }

  private prefersDark(): boolean {
    const win = this.document.defaultView;
    return !!win?.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }

  private applyToDocument(theme: Theme): void {
    const root = this.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Native date/time pickers follow `color-scheme`, not Tailwind's `dark` class.
    root.style.colorScheme = theme;
  }
}
