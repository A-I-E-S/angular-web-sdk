import { Component, input } from '@angular/core';

/**
 * Consistent page title block used across playground catalog routes.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="mb-8 flex flex-col gap-3 border-b border-border pb-6 dark:border-white/10">
      @if (eyebrow()) {
        <p class="pg-kicker m-0">{{ eyebrow() }}</p>
      }
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex max-w-2xl flex-col gap-2">
          <h1 class="m-0 text-heading-2 text-ink dark:text-white">{{ title() }}</h1>
          @if (description()) {
            <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
              {{ description() }}
            </p>
          }
        </div>
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  /** Small uppercase label above the title (e.g. "Components"). */
  readonly eyebrow = input<string | null>(null);
  /** Page title. */
  readonly title = input.required<string>();
  /** One-line supporting copy. */
  readonly description = input<string | null>(null);
}
