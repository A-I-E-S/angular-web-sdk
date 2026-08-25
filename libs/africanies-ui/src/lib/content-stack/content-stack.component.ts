import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Compact stacked text for table cells and detail panels.
 *
 * Typical use: name, email, and a timestamp (Packaged by, Created by, …).
 * Missing lines are omitted so the stack stays tight.
 *
 * @example
 * ```html
 * <africanies-content-stack
 *   title="Oladotun Adedeji"
 *   subtitle="oladotun.a@africanies.com"
 *   extraLine="Aug 14, 2026, 2:04:22 PM"
 * />
 * ```
 */
@Component({
  selector: 'africanies-content-stack',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-w-0',
  },
  template: `
    <div class="flex min-w-0 flex-col gap-0.5">
      @if (title()) {
        <p class="m-0 text-body-sm font-medium text-ink dark:text-white">
          {{ title() }}
        </p>
      }
      @if (subtitle()) {
        <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
          {{ subtitle() }}
        </p>
      }
      @if (extraLine()) {
        <p class="m-0 text-caption text-neutral-500 dark:text-neutral-400">
          {{ extraLine() }}
        </p>
      }
    </div>
  `,
})
export class ContentStackComponent {
  /** Primary line — usually a person or entity name. */
  readonly title = input('');

  /** Supporting line — usually an email. */
  readonly subtitle = input('');

  /** Trailing line — usually a formatted date or other caption. */
  readonly extraLine = input('');
}
