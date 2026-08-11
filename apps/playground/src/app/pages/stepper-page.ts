import { Component, computed, signal } from '@angular/core';
import {
  ButtonComponent,
  StepDefDirective,
  StepperComponent,
  TextInputComponent,
  type StepDefinition,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { STEPPER_FREE, STEPPER_LINEAR } from '../snippets';

@Component({
  selector: 'app-stepper-page',
  standalone: true,
  imports: [
    StepperComponent,
    StepDefDirective,
    ButtonComponent,
    TextInputComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Stepper"
        description="Wizard navigation for multi-step flows — not a shipment status timeline."
      />

      <app-demo-section
        title="Linear wizard"
        hint="Forward is blocked while the active step sets isValid to false."
        badge="linear"
        [code]="linearCode"
      >
        <div class="mb-5 flex flex-wrap items-center gap-4">
          <label class="inline-flex items-center gap-2 text-body-sm text-ink dark:text-white">
            <input
              type="checkbox"
              class="accent-export"
              [checked]="routeValid()"
              (change)="routeValid.set($any($event.target).checked)"
            />
            Mark Route as valid
          </label>
          <span class="text-caption text-neutral-600">
            Step {{ linearIndex() + 1 }} of {{ linearSteps().length }}
          </span>
        </div>

        <aies-stepper
          [steps]="linearSteps()"
          [activeIndex]="linearIndex()"
          [linear]="true"
          (activeIndexChange)="linearIndex.set($event)"
        >
          <ng-template aiesStepDef="route">
            <div class="flex flex-col gap-4">
              <p class="m-0 text-body-sm text-neutral-600">
                Origin and destination for this shipment.
              </p>
              <div class="grid gap-4 md:grid-cols-2">
                <aies-text-input label="Origin city" [(value)]="origin" />
                <aies-text-input label="Destination city" [(value)]="destination" />
              </div>
            </div>
          </ng-template>
          <ng-template aiesStepDef="cargo">
            <div class="flex flex-col gap-4">
              <p class="m-0 text-body-sm text-neutral-600">Describe what you are shipping.</p>
              <aies-text-input label="Commodity" [(value)]="commodity" />
            </div>
          </ng-template>
          <ng-template aiesStepDef="review">
            <div
              class="rounded-lg border border-border bg-background-welcome p-4 text-body-sm dark:border-white/10 dark:bg-ink-950"
            >
              <p class="m-0 font-medium text-ink dark:text-white">Review</p>
              <ul class="mt-2 mb-0 list-disc pl-5 text-neutral-600">
                <li>{{ origin() || '—' }} → {{ destination() || '—' }}</li>
                <li>{{ commodity() || 'No commodity set' }}</li>
              </ul>
            </div>
          </ng-template>
        </aies-stepper>

        <div class="mt-5 flex gap-2">
          <button
            aies-button
            type="button"
            variant="ghost"
            [disabled]="linearIndex() === 0"
            (click)="linearIndex.set(linearIndex() - 1)"
          >
            Back
          </button>
          <button
            aies-button
            type="button"
            [disabled]="linearIndex() >= linearSteps().length - 1 || !canGoNext()"
            (click)="linearIndex.set(linearIndex() + 1)"
          >
            Next
          </button>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Non-linear"
        hint="Click any step header to jump — useful for review/edit flows."
        badge="free nav"
        [code]="freeCode"
      >
        <aies-stepper
          [steps]="freeSteps"
          [activeIndex]="freeIndex()"
          [linear]="false"
          (activeIndexChange)="freeIndex.set($event)"
        >
          <ng-template aiesStepDef="account">
            <p class="m-0 text-body text-ink dark:text-white">Account details step body.</p>
          </ng-template>
          <ng-template aiesStepDef="billing">
            <p class="m-0 text-body text-ink dark:text-white">Billing step body.</p>
          </ng-template>
          <ng-template aiesStepDef="confirm">
            <p class="m-0 text-body text-ink dark:text-white">Confirmation step body.</p>
          </ng-template>
        </aies-stepper>
      </app-demo-section>
    </div>
  `,
})
export class StepperPage {
  protected readonly linearIndex = signal(0);
  protected readonly freeIndex = signal(0);
  protected readonly routeValid = signal(false);
  protected readonly origin = signal('Lagos');
  protected readonly destination = signal('');
  protected readonly commodity = signal('');

  protected readonly linearSteps = computed<StepDefinition[]>(() => [
    { key: 'route', label: 'Route', isValid: this.routeValid() },
    { key: 'cargo', label: 'Cargo', isValid: true },
    { key: 'review', label: 'Review' },
  ]);

  protected readonly freeSteps: StepDefinition[] = [
    { key: 'account', label: 'Account' },
    { key: 'billing', label: 'Billing' },
    { key: 'confirm', label: 'Confirm' },
  ];

  protected readonly linearCode = STEPPER_LINEAR;
  protected readonly freeCode = STEPPER_FREE;

  protected canGoNext(): boolean {
    const current = this.linearSteps()[this.linearIndex()];
    return current?.isValid !== false;
  }
}
