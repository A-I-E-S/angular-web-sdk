import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';

import { ModeColorService } from '@africanies/africanies-theme';

import { StepDefDirective } from './step-def.directive';
import { StepDefinition } from './step-definition';

function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Multi-step wizard for form flows (e.g. shipment creation).
 *
 * Distinct from a status *timeline*: this component navigates wizard steps,
 * it does not display shipment delivery progress.
 *
 * Inputs: `steps`, `activeIndex`, and `linear` (default `true`). In linear
 * mode, header clicks only activate the current or a previous step; advance
 * with Next. Non-linear mode allows jumping to any step via its header.
 *
 * When `animateSteps` is true (default), the step body fades/slides via the
 * Web Animations API (skipped when the user prefers reduced motion).
 */
@Component({
  selector: 'africanies-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'block min-w-0' },
  styles: `
    .africanies-step-rail {
      scrollbar-width: thin;
    }
    .africanies-step-body {
      min-width: 0;
      overflow-x: clip;
      /* 2 px breathing room so focus-outline rings on edge fields are not clipped */
      padding-inline: 2px;
      margin-inline: -2px;
    }
    .africanies-step-pane {
      min-width: 0;
      will-change: opacity, transform;
    }
  `,
  template: `
    <div class="flex flex-col gap-5 text-ink dark:text-white">
      <div class="flex flex-col gap-2">
        <p
          class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Step {{ activeIndex() + 1 }} of {{ steps().length }}
          <span
            class="normal-case tracking-normal text-neutral-400 dark:text-neutral-500"
          >
            · {{ steps()[activeIndex()]?.label }}
          </span>
        </p>

        <div
          class="h-1 w-full overflow-hidden rounded-full bg-background-welcome dark:bg-white/10"
          aria-hidden="true"
        >
          <div
            class="h-full rounded-full transition-[width] duration-300 ease-out"
            [class]="modeColor.classes().bg"
            [style.width.%]="progressPercent()"
          ></div>
        </div>

        <ol
          class="africanies-step-rail m-0 flex list-none items-start gap-1 overflow-x-auto p-0 pb-1"
          role="list"
        >
          @for (step of steps(); track step.key; let i = $index) {
            <li class="flex min-w-0 shrink-0 items-center gap-1">
              <button
                type="button"
                class="inline-flex max-w-38 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed"
                [class]="headerButtonClass(i)"
                [attr.aria-current]="i === activeIndex() ? 'step' : null"
                [disabled]="!canActivate(i)"
                (click)="onHeaderClick(i)"
              >
                <span [class]="stepBadgeClass(i)" aria-hidden="true">
                  @if (i < activeIndex()) {
                    ✓
                  } @else {
                    {{ i + 1 }}
                  }
                </span>
                <span class="truncate text-body-sm font-medium">{{
                  step.label
                }}</span>
              </button>
              @if (i < steps().length - 1) {
                <span
                  class="hidden h-px w-4 shrink-0 bg-border sm:block dark:bg-white/15"
                  aria-hidden="true"
                ></span>
              }
            </li>
          }
        </ol>
      </div>

      <div class="africanies-step-body">
        @if (activeTemplate(); as tpl) {
          <div #stepPane class="africanies-step-pane">
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="stepContext()"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class StepperComponent {
  protected readonly modeColor = inject(ModeColorService);

  readonly steps = input.required<StepDefinition[]>();
  readonly activeIndex = input.required<number>();
  readonly linear = input(true, { transform: booleanAttribute });
  readonly animateSteps = input(true, { transform: booleanAttribute });
  readonly activeIndexChange = output<number>();

  private readonly stepDefs = contentChildren(StepDefDirective);
  private readonly stepPane = viewChild<ElementRef<HTMLElement>>('stepPane');
  private readonly animatedIndex = signal<number | null>(null);

  private readonly stepTemplateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.stepDefs()) {
      map.set(def.africaniesStepDef(), def.template);
    }
    return map;
  });

  protected readonly activeTemplate = computed(() => {
    const step = this.steps()[this.activeIndex()];
    if (!step) {
      return null;
    }
    return this.stepTemplateMap().get(step.key) ?? null;
  });

  protected readonly stepContext = computed(() => {
    const step = this.steps()[this.activeIndex()];
    return { $implicit: step?.key ?? '' };
  });

  protected readonly progressPercent = computed(() => {
    const total = this.steps().length;
    if (total <= 0) {
      return 0;
    }
    return ((this.activeIndex() + 1) / total) * 100;
  });

  constructor() {
    afterRenderEffect(() => {
      if (!this.animateSteps()) {
        return;
      }
      const index = this.activeIndex();
      const el = this.stepPane()?.nativeElement;
      if (!el) {
        return;
      }
      const previous = this.animatedIndex();
      if (previous === index) {
        return;
      }
      this.animatedIndex.set(index);
      if (previous === null || prefersReducedMotion()) {
        return;
      }
      const forward = index > previous;
      el.animate(
        [
          {
            opacity: 0,
            transform: `translateX(${forward ? '1rem' : '-1rem'})`,
          },
          { opacity: 1, transform: 'translateX(0)' },
        ],
        {
          duration: 280,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      );
    });
  }

  protected headerButtonClass(index: number): string {
    const active = index === this.activeIndex();
    const past = index < this.activeIndex();
    if (active) {
      return 'bg-background-welcome text-ink dark:bg-white/10 dark:text-white';
    }
    if (past) {
      return 'cursor-pointer text-ink hover:bg-background-welcome dark:text-white dark:hover:bg-white/10';
    }
    return 'opacity-40 text-neutral-500 dark:text-neutral-400';
  }

  protected stepBadgeClass(index: number): string {
    const base =
      'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-body-sm font-medium';
    if (index <= this.activeIndex()) {
      const c = this.modeColor.classes();
      return `${base} ${c.border} ${c.bg} text-white`;
    }
    return `${base} border-border bg-white text-neutral-500 dark:border-white/20 dark:bg-ink-950 dark:text-neutral-400`;
  }

  protected canActivate(index: number): boolean {
    if (index === this.activeIndex()) {
      return true;
    }
    if (!this.linear()) {
      return true;
    }
    return index < this.activeIndex();
  }

  protected onHeaderClick(index: number): void {
    if (index === this.activeIndex()) {
      return;
    }
    if (!this.canActivate(index)) {
      return;
    }
    this.activeIndexChange.emit(index);
  }
}
