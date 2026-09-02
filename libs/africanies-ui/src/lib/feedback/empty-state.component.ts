import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

import { ButtonComponent } from '../button/button.component';

/**
 * Blocking empty state when a fetch succeeded but produced no rows / value.
 *
 * Retry is **always** present because "no results" often changes after a
 * filter reset or fresh fetch. Omitting a `(retry)` handler is a misuse of
 * this component, not a supported configuration.
 *
 * @example
 * ```html
 * <africanies-empty-state
 *   message="No shipments match these filters."
 *   (retry)="resetFilters()"
 * />
 * ```
 */
@Component({
  selector: 'africanies-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent],
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center text-ink dark:text-white"
      role="status"
    >
      <africanies-icon name="inbox" [size]="32" class="text-neutral-400" />
      <p class="m-0 text-body text-neutral-600 dark:text-neutral-400 max-w-md">{{ message() }}</p>
      <button
        africanies-button
        type="button"
        variant="flat"
        [disabled]="refreshing()"
        (click)="retry.emit()"
      >
        <africanies-icon
          name="refresh"
          [size]="16"
          [class]="refreshing() ? 'animate-spin' : ''"
        />
        Retry
      </button>
    </div>
  `,
})
export class EmptyStateComponent {
  /**
   * Empty-copy. Defaults to a generic phrase; override for filter-specific help.
   */
  readonly message = input('No results found.');

  /**
   * Background refetch in flight — spins the refresh icon and disables Retry.
   */
  readonly refreshing = input(false, { transform: booleanAttribute });

  /**
   * Emitted when the user activates Retry.
   *
   * Always wire a handler — omitting `(retry)` is a misuse, not a valid
   * "static empty illustration" mode.
   */
  readonly retry = output<void>();
}
