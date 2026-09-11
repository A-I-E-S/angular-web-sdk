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
 * Prefer these for common statuses. For one-off accents, pass {@link ChipComponent.color}
 * instead — any CSS color with a faded background.
 *
 * - `neutral` — generic label / count
 * - `success` — positive outcome (same green family as export)
 * - `warning` — caution / pending
 * - `danger` — error / exception
 * - `info` — informational (theme blue)
 * - `violet` / `teal` / `rose` / `cyan` — extra categorical tones
 * - `export` — SFN / outbound accent
 * - `import` — STN / inbound accent
 */
export type ChipVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'violet'
  | 'teal'
  | 'rose'
  | 'cyan'
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
 * light-only subtle backgrounds). Pass {@link color} for a custom accent —
 * text uses that color and the background is a faded mix of the same.
 *
 * @example
 * ```html
 * <africanies-chip variant="success">Delivered</africanies-chip>
 * <africanies-chip variant="violet">Priority</africanies-chip>
 * <africanies-chip color="#0f766e">Pay Later</africanies-chip>
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
    '[style.--africanies-chip-accent]': 'customAccent()',
    role: 'status',
  },
  styles: `
    :host.africanies-chip--custom {
      color: var(--africanies-chip-accent);
      background-color: color-mix(
        in srgb,
        var(--africanies-chip-accent) 14%,
        transparent
      );
      border-color: color-mix(
        in srgb,
        var(--africanies-chip-accent) 28%,
        transparent
      );
    }
    :host-context(.dark):host.africanies-chip--custom {
      /* Lighten the accent so labels stay readable on dark surfaces. */
      color: color-mix(in srgb, var(--africanies-chip-accent) 68%, white);
      background-color: color-mix(
        in srgb,
        var(--africanies-chip-accent) 22%,
        transparent
      );
      border-color: color-mix(
        in srgb,
        var(--africanies-chip-accent) 40%,
        transparent
      );
    }
  `,
  template: `
    @if (icon(); as iconName) {
      <africanies-icon [name]="iconName" [size]="iconSize()" class="shrink-0" />
    }
    <span class="min-w-0 truncate"><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
        [attr.aria-label]="removeLabel()"
        (click)="onRemove($event)"
      >
        <africanies-icon name="close" [size]="12" />
      </button>
    }
  `,
})
/**
 * Compact status / category label.
 */
export class ChipComponent {
  /** Semantic tone. Defaults to `neutral`. Ignored when {@link color} is set. */
  readonly variant = input<ChipVariant>('neutral');

  /**
   * Optional CSS color (`#7c3aed`, `rgb(…)`, `oklch(…)`, …). When set, overrides
   * {@link variant}: label uses the color and the fill is a faded mix of it.
   */
  readonly color = input<string | null>(null);

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

  /** Trimmed custom accent, or `null` when using a named {@link variant}. */
  protected readonly customAccent = computed(() => {
    const value = this.color()?.trim() ?? '';
    return value.length > 0 ? value : null;
  });

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
   * Soft background + text per variant, or the custom-color host class.
   * Dark mode uses translucent accents so chips never wash out as near-white
   * blobs.
   * @returns Tailwind / host class string for the active tone.
   */
  private toneClass(): string {
    if (this.customAccent()) {
      return 'africanies-chip--custom';
    }
    switch (this.variant()) {
      case 'success':
      case 'export':
        return 'bg-export-subtle text-export-strong dark:bg-export/15 dark:text-export-light';
      case 'import':
        return 'bg-import-subtle text-import-strong dark:bg-import/15 dark:text-import-light';
      case 'warning':
        return 'bg-warning-subtle text-warning-dark dark:bg-warning/15 dark:text-warning';
      case 'danger':
        return 'bg-danger-subtle text-danger-dark dark:bg-danger/15 dark:text-danger';
      case 'info':
        return 'bg-info-subtle text-info dark:bg-info/20 dark:text-[#93c5fd]';
      case 'violet':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300';
      case 'teal':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300';
      case 'rose':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300';
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
