import {
  inject,
  Injectable,
  InjectionToken,
  type Signal,
} from '@angular/core';

/**
 * Optional host-provided active language signal. When set, {@link AfricaniesUiI18n.t}
 * re-evaluates inside computed/templates after language changes.
 */
export const AFRICANIES_UI_LANG = new InjectionToken<Signal<string>>(
  'AFRICANIES_UI_LANG',
);

/**
 * Optional host translate function (e.g. Transloco). Keys use the
 * `africaniesUi.*` namespace from `assets/i18n/{lang}.json`.
 */
export const AFRICANIES_UI_TRANSLATE = new InjectionToken<
  (key: string) => string
>('AFRICANIES_UI_TRANSLATE');

/**
 * Resolves SDK chrome copy. Without host providers, returns English fallbacks.
 */
@Injectable({ providedIn: 'root' })
export class AfricaniesUiI18n {
  private readonly translateFn = inject(AFRICANIES_UI_TRANSLATE, {
    optional: true,
  });
  private readonly lang = inject(AFRICANIES_UI_LANG, { optional: true });

  t(key: string, fallback: string): string {
    this.lang?.();
    if (!this.translateFn) {
      return fallback;
    }
    const value = this.translateFn(key);
    return !value || value === key ? fallback : value;
  }

  /**
   * Interpolation for `{{name}}` placeholders (pagination, etc.).
   */
  tParams(
    key: string,
    fallback: string,
    params: Record<string, string | number>,
  ): string {
    let out = this.t(key, fallback);
    for (const [name, value] of Object.entries(params)) {
      out = out.split(`{{${name}}}`).join(String(value));
    }
    return out;
  }
}
