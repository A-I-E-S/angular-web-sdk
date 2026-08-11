import { booleanAttribute, Component, input } from '@angular/core';

/**
 * Labeled demo canvas for showcasing a component variant group.
 */
@Component({
  selector: 'app-demo-section',
  standalone: true,
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div class="flex flex-col gap-1">
          <h2 class="m-0 text-heading-3 text-ink dark:text-white">{{ title() }}</h2>
          @if (hint()) {
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              {{ hint() }}
            </p>
          }
        </div>
        @if (badge()) {
          <span
            class="self-start rounded-md bg-border px-2 py-0.5 text-caption text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
          >
            {{ badge() }}
          </span>
        }
      </div>
      <div [class]="muted() ? 'pg-demo-muted' : 'pg-demo'">
        <ng-content />
      </div>
    </section>
  `,
})
export class DemoSectionComponent {
  /** Section heading. */
  readonly title = input.required<string>();
  /** Optional supporting sentence. */
  readonly hint = input<string | null>(null);
  /** Optional meta chip (e.g. "4 variants"). */
  readonly badge = input<string | null>(null);
  /** Use dashed muted canvas instead of solid white. */
  readonly muted = input(false, { transform: booleanAttribute });
}
