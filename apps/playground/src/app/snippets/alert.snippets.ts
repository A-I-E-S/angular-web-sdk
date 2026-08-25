/**
 * Playground snippets — Alert.
 */

export /**
 *
 */
const ALERT_VARIANTS = `
// Inline banners for info / success / warning / danger.
// Parent owns visibility. Not a toast, and not for full-page fetch failures.

import { Component, signal } from '@angular/core';
import { AlertComponent, ButtonComponent, type AlertVariant } from '@africanies/africanies-ui';

@Component({
  selector: 'app-alert-demo',
  standalone: true,
  imports: [AlertComponent, ButtonComponent],
  template: \`
    <div class="flex flex-col gap-3">
      @for (v of variants; track v) {
        <africanies-alert
          [variant]="v"
          [title]="titles[v]"
          [message]="messages[v]"
        />
      }
    </div>
  \`,
})
export class AlertDemo {
  readonly variants: AlertVariant[] = ['info', 'success', 'warning', 'danger'];

  readonly titles: Record<AlertVariant, string> = {
    info: 'Document checklist',
    success: 'Submitted',
    warning: 'Rates may be stale',
    danger: 'Cannot release',
  };

  readonly messages: Record<AlertVariant, string> = {
    info: 'Commercial invoice and packing list are still required.',
    success: 'Shipment SFN-1042 was submitted to the carrier.',
    warning: 'Last rate pull was more than 4 hours ago.',
    danger: 'Customs hold blocks release until documents are approved.',
  };
}
`;

export /**
 *
 */
const ALERT_DISMISSIBLE = `
// Dismissible by default — listen to (dismissed) and unmount with @if.
// Set [dismissible]="false" when the notice has to stay.

import { Component, signal } from '@angular/core';
import { AlertComponent, ButtonComponent } from '@africanies/africanies-ui';

@Component({
  selector: 'app-alert-dismiss-demo',
  standalone: true,
  imports: [AlertComponent, ButtonComponent],
  template: \`
    @if (showBanner()) {
      <africanies-alert
        variant="warning"
        title="Rates outdated"
        message="Refresh to pull the latest carrier rates before quoting."
        (dismissed)="showBanner.set(false)"
      >
        <button
          africanies-button
          type="button"
          size="sm"
          class="mt-2"
          (click)="refresh()"
        >
          Refresh rates
        </button>
      </africanies-alert>
    } @else {
      <button africanies-button type="button" variant="secondary" size="sm" (click)="showBanner.set(true)">
        Show banner again
      </button>
    }

    <!-- Permanent notice — no close control -->
    <africanies-alert
      class="mt-4 block"
      variant="info"
      message="This environment is connected to the staging API."
      [dismissible]="false"
    />
  \`,
})
export class AlertDismissDemo {
  readonly showBanner = signal(true);

  refresh(): void {
    // refetch rates…
    this.showBanner.set(false);
  }
}
`;
