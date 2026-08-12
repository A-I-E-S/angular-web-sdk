import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import type { AiesMenuItem } from '../action-menu/menu-item';
import { AvatarComponent, type AvatarSize } from './avatar.component';

/**
 * Avatar trigger with an attached overflow menu — profile / account actions.
 *
 * @example
 * ```html
 * <aies-avatar-menu
 *   name="Jane Doe"
 *   src="/avatars/jane.jpg"
 *   [menuItems]="accountMenu"
 * />
 * ```
 */
@Component({
  selector: 'aies-avatar-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent,
    ActionMenuComponent,
    ActionMenuTriggerDirective,
    AiesIconComponent,
  ],
  template: `
    <aies-action-menu
      [items]="menuItems()"
      [ariaLabel]="ariaLabel()"
      [disabled]="disabled()"
    >
      <button
        type="button"
        aiesActionMenuTrigger
        class="inline-flex items-center gap-1 rounded-lg p-0.5 pr-1 transition-colors hover:bg-background-welcome focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/10"
        [attr.aria-label]="ariaLabel()"
      >
        <aies-avatar [name]="name()" [src]="src()" [size]="size()" />
        @if (showCaret()) {
          <aies-icon
            name="chevron-down"
            [size]="14"
            class="shrink-0 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        }
      </button>
    </aies-action-menu>
  `,
})
export class AvatarMenuComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly menuItems = input.required<AiesMenuItem[]>();
  readonly size = input<AvatarSize>('md');
  readonly ariaLabel = input('Account menu');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** When true (default), show a chevron beside the avatar. */
  readonly showCaret = input(true, { transform: booleanAttribute });
}
