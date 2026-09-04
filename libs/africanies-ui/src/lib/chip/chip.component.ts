import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import type { IconName } from '@africanies/africanies-icons';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';

/**
 * Semantic tone for {@link ChipComponent}.
 *
 * - `neutral` — generic label / count
 * - `success` — positive outcome (same green family as export)
 * - `warning` — caution / pending
 * - `danger` — error / exception
 * - `export` — SFN / outbound accent
 * - `import` — STN / inbound accent
 */
export type ChipVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'export'
  | 'import';

/**
 * Control size for {@link ChipComponent}.
 */
export type ChipSize = 'sm' | 'md';

/**
 * Compact status / category label.
 *
 * Soft fills stay readable in dark mode (translucent accent tints, not
 * light-only subtle backgrounds).
 *
 * @example
 * ```html
 * <africanies-chip variant="success">Delivered</africanies-chip>
 * <africanies-chip variant="import" icon="truck">In transit</africanies-chip>
 * <africanies-chip variant="warning" [removable]="true" (removed)="clear()">Pending</africanies-chip>
 * ```
 */
@Component({
  selector: 'africanies-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent],
  host: {
    '[class]': 'hostClass()',
    role: 'status',
  },
  template: `
    @if (icon(); as iconName) {
      <africanies-icon [name]="iconName" [size]="iconSize()" class="shrink-0" />
    }
    <span class="min-w-0 truncate"><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink"
        [attr.aria-label]="removeLabel()"
        (click)="onRemove($event)"
      >
        <africanies-icon name="close" [size]="12" />
      </button>
    }
  `,
})
export class ChipComponent {
  /** Semantic tone. Defaults to `neutral`. */
  readonly variant = input<ChipVariant>('neutral');

  /** Padding / type scale. Defaults to `sm` (table / dense UI). */
  readonly size = input<ChipSize>('sm');

  /** Optional leading icon. */
  readonly icon = input<IconName | undefined>(undefined);

  /**
   * When true, shows a remove control that emits {@link removed}. Parent owns
   * list state — this component does not unmount itself.
   */
  readonly removable = input(false, { transform: booleanAttribute });

  /** Accessible label for the remove control. */
  readonly removeLabel = input('Remove');

  /** Emitted when the remove control is activated. */
  readonly removed = output<void>();

  protected readonly iconSize = computed(() => (this.size() === 'md' ? 14 : 12));

  protected readonly hostClass = computed(() => {
    const base =
      'inline-flex max-w-full items-center gap-1 rounded-md font-sans font-medium ' +
      'border border-transparent';

    const sizes: Record<ChipSize, string> = {
      sm: 'px-2 py-0.5 text-caption',
      md: 'px-2.5 py-1 text-body-sm',
    };

    return `${base} ${sizes[this.size()]} ${this.toneClass()}`;
  });

  /**
   * Soft background + text per variant. Dark mode uses translucent accents so
   * chips never wash out as near-white blobs.
   * @returns Tailwind class string for the active variant.
   */
  private toneClass(): string {
    switch (this.variant()) {
      case 'success':
      case 'export':
        return 'bg-export-subtle text-export dark:bg-export/15 dark:text-export-light';
      case 'import':
        return 'bg-import-subtle text-import dark:bg-import/15 dark:text-import-light';
      case 'warning':
        return 'bg-warning-subtle text-warning-dark dark:bg-warning/15 dark:text-warning';
      case 'danger':
        return 'bg-danger-subtle text-danger dark:bg-danger/15 dark:text-danger';
      default:
        return 'bg-border/60 text-ink dark:bg-white/10 dark:text-neutral-200';
    }
  }

  /**
   * @param event - Click on the remove control.
   */
  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit();
  }
}
