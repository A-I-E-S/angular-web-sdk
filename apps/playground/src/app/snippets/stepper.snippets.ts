/**
 * Playground code snippets — Stepper (wizard navigation).
 * Each export is a copy-ready implementation guide for demo panels.
 */

export /**
 *
 */
const STEPPER_LINEAR = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Multi-step wizard with forward-blocking linear navigation.
// Prerequisites: @aies/aies-ui StepperComponent + StepDefDirective; reactive
//                step validity (forms, signals, or computed).
// Do:            Match aiesStepDef keys to StepDefinition.key; drive isValid
//                from real form state; wire activeIndex / activeIndexChange;
//                provide external Back/Next that respect canGoNext().
// Don't:        Use aies-stepper as a shipment status timeline — it navigates
//                wizard steps, it does not render delivery progress events.
// ───────────────────────────────────────────────────────────────────────

import { Component, computed, signal } from '@angular/core';
import {
  ButtonComponent,
  StepDefDirective,
  StepperComponent,
  TextInputComponent,
  type StepDefinition,
} from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-wizard',
  standalone: true,
  imports: [
    StepperComponent,
    StepDefDirective,
    ButtonComponent,
    TextInputComponent,
  ],
  template: \`
    <aies-stepper
      [steps]="steps()"
      [activeIndex]="activeIndex()"
      [linear]="true"
      (activeIndexChange)="activeIndex.set($event)"
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
        [disabled]="activeIndex() === 0"
        (click)="activeIndex.set(activeIndex() - 1)"
      >
        Back
      </button>
      <button
        aies-button
        type="button"
        [disabled]="activeIndex() >= steps().length - 1 || !canGoNext()"
        (click)="activeIndex.set(activeIndex() + 1)"
      >
        Next
      </button>
    </div>
  \`,
})
export class ShipmentWizardComponent {
  // Zero-based index of the visible step — bind two-way via activeIndexChange.
  protected readonly activeIndex = signal(0);

  // Route step validity — when false, linear mode blocks forward navigation.
  protected readonly routeValid = signal(false);

  protected readonly origin = signal('Lagos');
  protected readonly destination = signal('');
  protected readonly commodity = signal('');

  // Recompute isValid when routeValid changes so the stepper header reflects state.
  protected readonly steps = computed<StepDefinition[]>(() => [
    { key: 'route', label: 'Route', isValid: this.routeValid() },
    { key: 'cargo', label: 'Cargo', isValid: true },
    { key: 'review', label: 'Review' },
  ]);

  // Mirror the stepper's linear rule: forward is blocked when isValid === false.
  protected canGoNext(): boolean {
    const current = this.steps()[this.activeIndex()];
    return current?.isValid !== false;
  }
}
`;

export /**
 *
 */
const STEPPER_FREE = `
// ── ARCHITECT GUIDE ─────────────────────────────────────────────────────
// Intent:       Non-linear stepper — users jump to any step via header clicks.
// Prerequisites: @aies/aies-ui StepperComponent + StepDefDirective; static or
//                slowly-changing StepDefinition[] (no per-step validity gate).
// Do:            Set [linear]="false"; keep aiesStepDef keys aligned with steps;
//                use for review/edit flows where earlier steps may be revisited.
// Don't:        Rely on isValid to gate navigation in free mode — headers ignore
//                forward-blocking; use linear=true when wizard order matters.
// ───────────────────────────────────────────────────────────────────────

import { Component, signal } from '@angular/core';
import {
  StepDefDirective,
  StepperComponent,
  type StepDefinition,
} from '@aies/aies-ui';

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [StepperComponent, StepDefDirective],
  template: \`
    <aies-stepper
      [steps]="steps"
      [activeIndex]="activeIndex()"
      [linear]="false"
      (activeIndexChange)="activeIndex.set($event)"
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
  \`,
})
export class AccountSetupComponent {
  protected readonly activeIndex = signal(0);

  // Static definitions — isValid is optional and unused when linear=false.
  protected readonly steps: StepDefinition[] = [
    { key: 'account', label: 'Account' },
    { key: 'billing', label: 'Billing' },
    { key: 'confirm', label: 'Confirm' },
  ];
}
`;
