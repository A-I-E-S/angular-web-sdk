import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

import { AfricaniesIconComponent } from '@africanies/africanies-icons';

/**
 * Visual density for {@link AccordionComponent}.
 *
 * - `md` — page sections (pay review, top-level cards)
 * - `sm` — nested panels (e.g. export boxes inside a manifest box)
 */
export type AccordionSize = 'md' | 'sm';

/**
 * Bordered expandable panel with animated fold — the pattern used on
 * Manifest detail and Make Payment review.
 *
 * Parent owns open state via {@link open} (`model()` / `[(open)]`).
 *
 * @example
 * ```html
 * <africanies-accordion
 *   title="Customer Information"
 *   [open]="isOpen('customer')"
 *   (openChange)="onOpenChange('customer', $event)"
 * >
 *   <dl>…</dl>
 * </africanies-accordion>
 * ```
 */
@Component({
  selector: 'africanies-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AfricaniesIconComponent],
  host: {
    class: 'block',
  },
  styles: `
    .africanies-accordion-fold {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 200ms ease;
    }

    .africanies-accordion-fold-open {
      grid-template-rows: 1fr;
    }

    .africanies-accordion-fold-body {
      min-height: 0;
      overflow: hidden;
    }

    @media (prefers-reduced-motion: reduce) {
      .africanies-accordion-fold {
        transition: none;
      }
    }
  `,
  template: `
    <div [class]="shellClass()">
      <button
        type="button"
        [class]="triggerClass()"
        [attr.aria-expanded]="open()"
        (click)="toggle()"
      >
        <span class="min-w-0 flex-1 font-medium">
          <ng-content select="[africaniesAccordionTitle]" />
          @if (title()) {
            {{ title() }}
          }
        </span>
        <africanies-icon
          name="chevron-down"
          class="shrink-0 transition-transform duration-200"
          [class.rotate-180]="open()"
          [size]="chevronSize()"
        />
      </button>
      <div
        class="africanies-accordion-fold"
        [class.africanies-accordion-fold-open]="open()"
      >
        <div class="africanies-accordion-fold-body">
          <div [class]="bodyClass()">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AccordionComponent {
  /** Plain-text header. Prefer projected `[africaniesAccordionTitle]` for rich titles. */
  readonly title = input('');

  /** Whether the panel body is expanded. */
  readonly open = model(false);

  /** Padding / chevron density. */
  readonly size = input<AccordionSize>('md');

  protected readonly chevronSize = computed(() =>
    this.size() === 'sm' ? 14 : 16,
  );

  protected readonly shellClass = computed(() =>
    this.size() === 'sm'
      ? 'rounded-lg border border-border dark:border-white/10'
      : 'rounded-xl border border-border dark:border-white/10',
  );

  protected readonly triggerClass = computed(() =>
    this.size() === 'sm'
      ? 'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-ink dark:text-white'
      : 'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-ink dark:text-white',
  );

  protected readonly bodyClass = computed(() =>
    this.size() === 'sm'
      ? 'border-t border-border px-3 py-2 dark:border-white/10'
      : 'border-t border-border px-4 py-3 dark:border-white/10',
  );

  protected toggle(): void {
    this.open.update((value) => !value);
  }
}
