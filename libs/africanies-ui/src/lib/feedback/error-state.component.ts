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
 * Blocking error state for failed async fetches (not field validation).
 *
 * The retry control is **always** visible — there is no hide-retry toggle.
 * Omitting a `(retry)` handler is a misuse of this component, not a supported
 * configuration: failed fetches that cannot be retried should use different UI.
 *
 * @example
 * ```html
 * <africanies-error-state
 *   [message]="errorMessage()"
 *   (retry)="reload()"
 * />
 * ```
 */
@Component({
  selector: 'africanies-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent, ButtonComponent],
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center text-ink dark:text-white"
      role="alert"
    >
      <africanies-icon name="warning" [size]="32" class="text-danger" />
      <p class="m-0 text-body text-danger max-w-md">{{ message() }}</p>
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
export class ErrorStateComponent {
  /**
   * Human-readable failure reason. Required so the alert is never an empty
   * red box without explanation.
   */
  readonly message = input.required<string>();

  /**
   * Background refetch in flight — spins the refresh icon and disables Retry.
   */
  readonly refreshing = input(false, { transform: booleanAttribute });

  /**
   * Emitted when the user activates Retry.
   *
   * Always wire a handler — omitting `(retry)` is a misuse, not a valid
   * "read-only error" mode.
   */
  readonly retry = output<void>();
}
