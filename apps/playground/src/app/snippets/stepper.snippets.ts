// Stepper (wizard) copy-paste examples.

export /**
 *
 */
const STEPPER_LINEAR = `// Multi-step wizard with forward-blocking. Match africaniesStepDef keys to StepDefinition.key.
// Drive isValid from real form state; wire your own Back/Next around canGoNext().
// This is wizard nav — not a shipment status timeline.

import { Component, computed, signal } from '@angular/core';
import {
  ButtonComponent,
  StepDefDirective,
  StepperComponent,
  TextInputComponent,
  type StepDefinition,
} from '@africanies/africanies-ui';

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
    <africanies-stepper
      [steps]="steps()"
      [activeIndex]="activeIndex()"
      [linear]="true"
      (activeIndexChange)="activeIndex.set($event)"
    >
      <ng-template africaniesStepDef="route">
        <div class="flex flex-col gap-4">
          <p class="m-0 text-body-sm text-neutral-600">
            Origin and destination for this shipment.
          </p>
          <div class="grid gap-4 md:grid-cols-2">
            <africanies-text-input label="Origin city" [(value)]="origin" />
            <africanies-text-input label="Destination city" [(value)]="destination" />
          </div>
        </div>
      </ng-template>

      <ng-template africaniesStepDef="cargo">
        <div class="flex flex-col gap-4">
          <p class="m-0 text-body-sm text-neutral-600">Describe what you are shipping.</p>
          <africanies-text-input label="Commodity" [(value)]="commodity" />
        </div>
      </ng-template>

      <ng-template africaniesStepDef="review">
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
    </africanies-stepper>

    <div class="mt-5 flex gap-2">
      <button
        africanies-button
        type="button"
        variant="ghost"
        [disabled]="activeIndex() === 0"
        (click)="activeIndex.set(activeIndex() - 1)"
      >
        Back
      </button>
      <button
        africanies-button
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
  protected readonly activeIndex = signal(0);
  protected readonly routeValid = signal(false);

  protected readonly origin = signal('Lagos');
  protected readonly destination = signal('');
  protected readonly commodity = signal('');

  protected readonly steps = computed<StepDefinition[]>(() => [
    { key: 'route', label: 'Route', isValid: this.routeValid() },
    { key: 'cargo', label: 'Cargo', isValid: true },
    { key: 'review', label: 'Review' },
  ]);

  protected canGoNext(): boolean {
    const current = this.steps()[this.activeIndex()];
    return current?.isValid !== false;
  }
}
`;

export /**
 *
 */
const STEPPER_FREE = `// Non-linear — users can jump to any step via the header.
// isValid won't gate navigation here; use linear=true when order matters.

import { Component, signal } from '@angular/core';
import {
  StepDefDirective,
  StepperComponent,
  type StepDefinition,
} from '@africanies/africanies-ui';

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [StepperComponent, StepDefDirective],
  template: \`
    <africanies-stepper
      [steps]="steps"
      [activeIndex]="activeIndex()"
      [linear]="false"
      (activeIndexChange)="activeIndex.set($event)"
    >
      <ng-template africaniesStepDef="account">
        <p class="m-0 text-body text-ink dark:text-white">Account details step body.</p>
      </ng-template>

      <ng-template africaniesStepDef="billing">
        <p class="m-0 text-body text-ink dark:text-white">Billing step body.</p>
      </ng-template>

      <ng-template africaniesStepDef="confirm">
        <p class="m-0 text-body text-ink dark:text-white">Confirmation step body.</p>
      </ng-template>
    </africanies-stepper>
  \`,
})
export class AccountSetupComponent {
  protected readonly activeIndex = signal(0);

  protected readonly steps: StepDefinition[] = [
    { key: 'account', label: 'Account' },
    { key: 'billing', label: 'Billing' },
    { key: 'confirm', label: 'Confirm' },
  ];
}
`;
