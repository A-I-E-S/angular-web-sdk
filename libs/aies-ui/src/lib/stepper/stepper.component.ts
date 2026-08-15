import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';

import { ModeColorService } from '@aies/aies-theme';

import { StepDefDirective } from './step-def.directive';
import { StepDefinition } from './step-definition';

/**
 * Multi-step wizard for form flows (e.g. shipment creation).
 *
 * Distinct from a status *timeline*: this component navigates wizard steps,
 * it does not display shipment delivery progress.
 *
 * Inputs: `steps`, `activeIndex`, and `linear` (default `true`). In linear
 * mode, navigating forward past a step whose `isValid === false` is blocked;
 * non-linear mode allows jumping to any step via its header. Emits
 * `activeIndexChange` so parents can use two-way binding.
 *
 * Step *bodies* are projected with `<ng-template aiesStepDef="key">`.
 *
 * @example
 * ```ts
 * readonly steps = computed<StepDefinition[]>(() => [
 *   { key: 'route', label: 'Route', isValid: this.routeForm.valid },
 *   { key: 'cargo', label: 'Cargo', isValid: this.cargoForm.valid },
 *   { key: 'review', label: 'Review' },
 * ]);
 * readonly activeIndex = signal(0);
 * ```
 * ```html
 * <aies-stepper
 *   [steps]="steps()"
 *   [activeIndex]="activeIndex()"
 *   [linear]="true"
 *   (activeIndexChange)="activeIndex.set($event)"
 * >
 *   <ng-template aiesStepDef="route">
 *     <app-route-form [form]="routeForm" />
 *   </ng-template>
 *   <ng-template aiesStepDef="cargo">
 *     <app-cargo-form [form]="cargoForm" />
 *   </ng-template>
 *   <ng-template aiesStepDef="review">
 *     <app-shipment-review [draft]="draft()" />
 *   </ng-template>
 * </aies-stepper>
 *
 * <button aies-button type="button" variant="ghost"
 *   [disabled]="activeIndex() === 0"
 *   (click)="activeIndex.set(activeIndex() - 1)">
 *   Back
 * </button>
 * <button aies-button type="button"
 *   (click)="goNext()">
 *   Next
 * </button>
 * ```
 *
 * Linear blocking: if `route.isValid === false`, header-click / Next to
 * Cargo or Review is ignored until the route step becomes valid.
 */
@Component({
  selector: 'aies-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="flex flex-col gap-6 text-ink dark:text-white">
      <ol class="flex flex-wrap items-start gap-2 m-0 p-0 list-none" role="list">
        @for (step of steps(); track step.key; let i = $index) {
          <li class="flex items-center gap-2 min-w-0">
            <button
              type="button"
              class="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
              [class]="
                i === activeIndex()
                  ? 'inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 text-ink dark:text-white'
                  : 'inline-flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 text-neutral-500 dark:text-neutral-400'
              "
              [attr.aria-current]="i === activeIndex() ? 'step' : null"
              [disabled]="!canActivate(i)"
              (click)="onHeaderClick(i)"
            >
              <span
                [class]="stepBadgeClass(i)"
                aria-hidden="true"
              >
                @if (i < activeIndex()) {
                  ✓
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="text-body font-medium truncate">{{ step.label }}</span>
            </button>
            @if (i < steps().length - 1) {
              <span
                class="hidden sm:block h-px w-6 shrink-0 bg-border"
                aria-hidden="true"
              ></span>
            }
          </li>
        }
      </ol>

      <div class="min-w-0">
        @if (activeTemplate(); as tpl) {
          <ng-container
            [ngTemplateOutlet]="tpl"
            [ngTemplateOutletContext]="stepContext()"
          />
        }
      </div>
    </div>
  `,
})
export class StepperComponent {
  private readonly modeColor = inject(ModeColorService);

  /** Ordered step definitions for the header. */
  readonly steps = input.required<StepDefinition[]>();

  /** Zero-based index of the visible step. */
  readonly activeIndex = input.required<number>();

  /**
   * When true (default), forward jumps past an invalid step are blocked.
   * When false, any header may be activated.
   */
  readonly linear = input(true, { transform: booleanAttribute });

  /** Emitted when a header (or programmatic next) would change the index. */
  readonly activeIndexChange = output<number>();

  private readonly stepDefs = contentChildren(StepDefDirective);

  private readonly stepTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.stepDefs()) {
      map.set(def.aiesStepDef(), def.template);
    }
    return map;
  });

  /** Template for the currently active step key, if registered. */
  protected readonly activeTemplate = computed(() => {
    const step = this.steps()[this.activeIndex()];
    if (!step) {
      return null;
    }
    return this.stepTemplateMap().get(step.key) ?? null;
  });

  /** Context for the active step body (`let-key`). */
  protected readonly stepContext = computed(() => {
    const step = this.steps()[this.activeIndex()];
    return { $implicit: step?.key ?? '' };
  });

  /**
   * Badge chrome for step `index` (completed / active vs upcoming).
   * @param index - Step index in {@link steps}.
   * @returns Tailwind class string for the step badge.
   */
  protected stepBadgeClass(index: number): string {
    const base =
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-body-sm font-medium';
    if (index <= this.activeIndex()) {
      const c = this.modeColor.classes();
      return `${base} ${c.border} ${c.bg} text-white`;
    }
    return `${base} border-border bg-background-welcome dark:bg-ink-950 dark:border-white/20 text-neutral-600 dark:text-neutral-400`;
  }

  /**
   * Whether the given index may become active under the current `linear` mode.
   *
   * @param index - Candidate step index.
   * @returns True when navigation to `index` is allowed.
   */
  protected canActivate(index: number): boolean {
    if (index === this.activeIndex()) {
      return true;
    }
    if (!this.linear()) {
      return true;
    }
    // Backward navigation is always allowed in linear mode.
    if (index < this.activeIndex()) {
      return true;
    }
    // Forward: every step from current through index-1 must not be explicitly invalid.
    return this.forwardPathValid(index);
  }

  /**
   * Header click — emits only when {@link canActivate} allows the jump.
   *
   * @param index - Clicked step index.
   */
  protected onHeaderClick(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }
    if (!this.canActivate(index)) {
      return;
    }
    this.activeIndexChange.emit(index);
  }

  /**
   * True when every step in `[activeIndex, targetIndex)` has `isValid !== false`.
   *
   * @param targetIndex - Destination index (exclusive end of the validity scan).
   * @returns False if any step on the path is explicitly invalid.
   */
  private forwardPathValid(targetIndex: number): boolean {
    const steps = this.steps();
    const from = this.activeIndex();
    for (let i = from; i < targetIndex; i++) {
      if (steps[i]?.isValid === false) {
        return false;
      }
    }
    return true;
  }
}
