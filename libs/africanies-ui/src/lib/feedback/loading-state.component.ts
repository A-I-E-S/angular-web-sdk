import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import { ModeColorService } from '@africanies/africanies-theme';

/**
 * Layout density for {@link LoadingStateComponent}.
 *
 * - `block` — centered section placeholder (page / panel load)
 * - `inline` — compact row for toolbars and nested slots
 */
export type LoadingStateMode = 'inline' | 'block';

/**
 * Blocking / inline loading indicator for async surfaces.
 *
 * Spinner accent follows {@link ModeColorService} (SFN green / STN orange).
 *
 * @example
 * ```html
 * <africanies-loading-state message="Loading shipments…" />
 * <africanies-loading-state mode="inline" message="Refreshing…" />
 * ```
 */
@Component({
  selector: 'africanies-loading-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent],
  template: `
    <div
      [class]="
        mode() === 'block'
          ? 'flex flex-col items-center justify-center gap-3 py-10 px-4 text-center text-ink dark:text-white'
          : 'inline-flex items-center gap-2 text-ink dark:text-white'
      "
      role="status"
      aria-live="polite"
    >
      <africanies-icon
        name="spinner"
        [size]="mode() === 'block' ? 32 : 20"
        [class]="'animate-spin ' + modeColor.classes().text"
      />
      @if (message()) {
        <p
          class="m-0 text-neutral-600 dark:text-neutral-400"
          [class]="mode() === 'block' ? 'text-body' : 'text-body-sm'"
        >
          {{ message() }}
        </p>
      }
    </div>
  `,
})
export class LoadingStateComponent {
  protected readonly modeColor = inject(ModeColorService);

  /**
   * Optional status copy. Prefer a short verb phrase ("Loading…") so screen
   * readers hear useful context with `aria-live="polite"`.
   */
  readonly message = input<string | undefined>(undefined);

  /**
   * Layout mode. Defaults to `block` for section-level placeholders.
   */
  readonly mode = input<LoadingStateMode>('block');
}
