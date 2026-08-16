import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

/**
 * Visual emphasis for {@link ButtonComponent}.
 *
 * - `primary` — filled mode accent (SFN green / STN orange) for the main action
 * - `secondary` — outlined chrome for secondary actions
 * - `ghost` — neutral text-only for low-emphasis actions (Cancel, tertiary)
 * - `ghost-primary` — text-only mode accent (SFN green / STN orange)
 * - `danger` — destructive confirmations and deletes
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'ghost-primary'
  | 'danger';

/**
 * Control size for {@link ButtonComponent}.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Theme-token button used across AIES surfaces.
 *
 * WHY an attribute selector on native `button` / `a`: keeps semantics and
 * keyboard behavior on the host element (Enter/Space, focus rings) instead of
 * nesting an interactive element inside a custom component host.
 *
 * **Primary** and **ghost-primary** follow {@link ModeColorService} / shipping mode:
 * SFN → export green, STN → import orange.
 *
 * @example
 * ```html
 * <button aies-button type="button" variant="primary" (click)="save()">
 *   Save shipment
 * </button>
 *
 * <button aies-button type="button" variant="ghost-primary" size="sm">
 *   <aies-icon name="plus" [size]="14" />
 *   Add row
 * </button>
 *
 * <button aies-button type="button" variant="primary" [loading]="saving()">
 *   Save shipment
 * </button>
 *
 * <button aies-button type="button" variant="danger" size="sm" [disabled]="busy()">
 *   <aies-icon name="trash" [size]="16" />
 *   Delete
 * </button>
 * ```
 */
@Component({
  selector: 'button[aies-button], a[aies-button]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent],
  template: `
    <span
      class="inline-flex items-center justify-center gap-2"
      [class.invisible]="loading()"
      [attr.aria-hidden]="loading() ? true : null"
    >
      <ng-content />
    </span>
    @if (loading()) {
      <span
        class="pointer-events-none absolute inset-0 inline-flex items-center justify-center"
        aria-hidden="true"
      >
        <aies-icon
          name="spinner"
          [size]="spinnerSize()"
          class="animate-spin"
        />
      </span>
    }
  `,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-disabled]': 'inactive() ? true : null',
    '[attr.disabled]': 'inactive() ? true : null',
    '[attr.aria-busy]': 'loading() ? true : null',
    '[attr.tabindex]': 'inactive() ? -1 : null',
    '(click)': 'blockWhenDisabled($event)',
  },
})
export class ButtonComponent {
  private readonly modeColor = inject(ModeColorService);

  /**
   * Visual variant. Defaults to `primary` so a bare `aies-button` reads as the
   * main CTA without extra attributes.
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Padding / type scale. Defaults to `md` for form toolbars and dialogs.
   */
  readonly size = input<ButtonSize>('md');

  /**
   * When true, blocks pointer and keyboard activation. Also sets
   * `aria-disabled` for anchors that cannot use the native `disabled` attribute.
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * In-flight mutation. Replaces the label with a circular spinner while
   * keeping the control's width, and treats the host as disabled.
   *
   * Plain boolean (no `booleanAttribute`): confirm/dialog `[loading]="signal()"`
   * bindings must pass through `true` without attribute-string coercion.
   */
  readonly loading = input(false);

  protected readonly inactive = computed(
    () => this.disabled() || this.loading(),
  );

  protected readonly spinnerSize = computed(() => {
    const size = this.size();
    if (size === 'sm') {
      return 14;
    }
    if (size === 'lg') {
      return 18;
    }
    return 16;
  });

  /**
   * Composed Tailwind classes from theme tokens — kept as string literals so
   * the scanner retains utilities in the published UI bundle.
   */
  protected readonly hostClass = computed(() => {
    const base =
      'relative inline-flex items-center justify-center gap-2 box-border font-sans font-medium rounded-md border transition-colors cursor-pointer ' +
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ' +
      'disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed';

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-body-sm px-2.5 py-0 h-8',
      md: 'text-body px-3.5 py-0 h-10',
      lg: 'text-body-lg px-4 py-0 h-12',
    };

    const variant = this.variant();
    let variantClass: string;
    if (variant === 'primary') {
      variantClass = this.modeColor.classes().primary;
    } else if (variant === 'ghost-primary') {
      variantClass = this.modeColor.classes().ghostPrimary;
    } else if (variant === 'secondary') {
      variantClass =
        'bg-white dark:bg-ink-950 text-ink dark:text-white border-border dark:border-white/15 hover:bg-background-welcome dark:hover:bg-white/10';
    } else if (variant === 'ghost') {
      variantClass =
        'bg-transparent text-ink dark:text-white border-transparent hover:bg-background-welcome dark:hover:bg-white/10';
    } else {
      variantClass =
        'bg-danger text-white border-transparent hover:bg-danger-dark';
    }

    return `${base} ${sizes[this.size()]} ${variantClass}`;
  });

  /**
   * Anchors lack native `disabled` — block activation while keeping the cursor.
   *
   * Uses `stopPropagation` (not `stopImmediatePropagation`) so the host click
   * does not swallow the same-element `(click)` that starts confirm work.
   *
   * @param event
   */
  protected blockWhenDisabled(event: Event): void {
    if (this.inactive()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
