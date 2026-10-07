import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { AfricaniesUiI18n } from '../i18n/africanies-ui-i18n';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import type { AfricaniesMenuItem } from '../action-menu/menu-item';
import { ButtonComponent } from '../button/button.component';
import { flagCdnUrl } from './flag-cdn';
import type { LanguageSwitcherOption } from './language-switcher-option';

/**
 * Compact language menu with circular flagcdn (or custom) flags on the trigger
 * and each option row. Hosts own dictionaries and persistence; this only emits
 * the selected code.
 *
 * @example
 * ```html
 * <africanies-language-switcher
 *   [options]="[
 *     { code: 'en', label: 'English', flagCountryCode: 'gb' },
 *     { code: 'zh', label: '中文', flagCountryCode: 'cn' },
 *   ]"
 *   [value]="lang()"
 *   ariaLabel="Language"
 *   (valueChange)="setLang($event)"
 * />
 * ```
 */
@Component({
  selector: 'africanies-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActionMenuComponent,
    ActionMenuTriggerDirective,
    AfricaniesIconComponent,
    ButtonComponent,
  ],
  template: `
    <africanies-action-menu [items]="menuItems()" [ariaLabel]="resolvedAriaLabel()">
      <button
        africanies-button
        africaniesActionMenuTrigger
        type="button"
        variant="flat"
        size="sm"
        [disabled]="disabled()"
        [attr.aria-label]="resolvedAriaLabel()"
      >
        @if (activeFlagUrl(); as flagUrl) {
          <img
            [src]="flagUrl"
            alt=""
            width="16"
            height="16"
            class="size-4 shrink-0 rounded-full object-cover"
            loading="lazy"
            decoding="async"
          />
        }
        @if (showLabel()) {
          <span class="hidden sm:inline">{{ activeLabel() }}</span>
        }
        @if (showCaret()) {
          <africanies-icon
            name="chevron-down"
            [size]="14"
            class="shrink-0 text-neutral-600 dark:text-neutral-400"
            aria-hidden="true"
          />
        }
      </button>
    </africanies-action-menu>
  `,
})
/**
 * Compact language menu with circular flag prefixes and an optional caret.
 */
export class LanguageSwitcherComponent {
  private readonly i18n = inject(AfricaniesUiI18n);
  protected readonly resolvedAriaLabel = computed(() => {
    const label = this.ariaLabel();
    return label === 'Language'
      ? this.i18n.t('africaniesUi.language.ariaLabel', 'Language')
      : label;
  });

  /** Available languages (order preserved in the menu). */
  readonly options = input.required<readonly LanguageSwitcherOption[]>();
  /** Active language code. */
  readonly value = input.required<string>();
  /** Accessible name for the trigger and menu. */
  readonly ariaLabel = input('Language');
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * When true (default), show the active label beside the flag on `sm+`
   * viewports. The flag always remains.
   */
  readonly showLabel = input(true, { transform: booleanAttribute });
  /** When true (default), show a chevron after the label. */
  readonly showCaret = input(true, { transform: booleanAttribute });

  /** Emits the chosen language code when the user picks a row. */
  readonly valueChange = output<string>();

  protected readonly activeOption = computed(() => {
    const code = this.value();
    return this.options().find((option) => option.code === code) ?? null;
  });

  protected readonly activeFlagUrl = computed(() => {
    const option = this.activeOption();
    return option ? resolveFlagUrl(option) : null;
  });

  protected readonly activeLabel = computed(
    () => this.activeOption()?.label ?? this.value(),
  );

  protected readonly menuItems = computed((): AfricaniesMenuItem[] =>
    this.options().map((option) => ({
      label: option.label,
      imageUrl: resolveFlagUrl(option) ?? undefined,
      imageShape: 'circle',
      onClick: () => this.valueChange.emit(option.code),
    })),
  );
}

function resolveFlagUrl(option: LanguageSwitcherOption): string | null {
  if (option.flagUrl) {
    return option.flagUrl;
  }
  if (option.flagCountryCode) {
    return flagCdnUrl(option.flagCountryCode);
  }
  return null;
}
