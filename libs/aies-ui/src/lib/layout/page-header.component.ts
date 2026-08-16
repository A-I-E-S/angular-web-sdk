import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Page title + subtitle for product screens.
 *
 * Sit this **below** app-shell breadcrumbs (the shell content header does
 * that automatically via `headerTitle` / `headerSubtitle`). Pages outside
 * the shell can use the component directly.
 *
 * Optional `[actions]` slot for a toolbar on the right (filters, primary CTA).
 *
 * @example
 * ```html
 * <aies-page-header
 *   title="App Settings"
 *   subtitle="Company control panel for shipping, money, warehouses, staff, and partners."
 * />
 *
 * <aies-page-header title="Deliveries" subtitle="Inbound freight for this mode.">
 *   <button actions aies-button type="button" variant="primary">New</button>
 * </aies-page-header>
 * ```
 */
@Component({
  selector: 'aies-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
  template: `
    @if (title() || subtitle()) {
      <header
        class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="flex min-w-0 max-w-3xl flex-col gap-1">
          @if (title()) {
            <h1
              class="m-0 text-heading-3 font-bold text-ink dark:text-white"
            >
              {{ title() }}
            </h1>
          }
          @if (subtitle()) {
            <p class="m-0 text-body text-neutral-600 dark:text-neutral-400">
              {{ subtitle() }}
            </p>
          }
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2 empty:hidden">
          <ng-content select="[actions]" />
        </div>
      </header>
    }
  `,
})
export class PageHeaderComponent {
  /** Page heading. Omit when the shell already rendered a title. */
  readonly title = input('');

  /** One-line explanation of what this screen is for. */
  readonly subtitle = input('');
}
