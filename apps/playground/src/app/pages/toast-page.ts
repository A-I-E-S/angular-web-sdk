import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonComponent, ToastService } from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { TOAST_HTTP, TOAST_STACK, TOAST_VARIANTS } from '../snippets';

/**
 * Toast catalog — timed, persistent error, collapse, HTTP tagging docs.
 */
@Component({
  selector: 'app-toast-page',
  standalone: true,
  imports: [
    ButtonComponent,
    PageHeaderComponent,
    DemoSectionComponent,
    RouterLink,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header eyebrow="Components" title="Toast">
        <p
          description
          class="m-0 text-body text-neutral-600 dark:text-neutral-400"
        >
          Short messages in the corner after an action (saved, failed, reminder).
          Mounted with
          <a
            routerLink="/lecture"
            fragment="CDK"
            class="pg-glossary-link"
            >CDK</a
          >
          Overlay. Errors stay until dismissed; warnings linger longer; identical
          messages collapse into one with a count. Enable with provideAiesToasts().
        </p>
      </app-page-header>

      <app-demo-section
        title="Variants"
        hint="info / success auto-dismiss ~4.5s; warning ~8s; error stays until closed. Hover pauses the timer. A long stack scrolls inside the corner instead of running off-screen."
        [code]="variantsCode"
      >
        <div class="flex flex-wrap gap-2">
          <button aies-button type="button" variant="secondary" (click)="showInfo()">
            Info
          </button>
          <button aies-button type="button" (click)="showSuccess()">Success</button>
          <button aies-button type="button" variant="secondary" (click)="showWarning()">
            Warning
          </button>
          <button aies-button type="button" variant="danger" (click)="showError()">
            Error
          </button>
          <button aies-button type="button" variant="secondary" (click)="showManyErrors()">
            Several errors
          </button>
          <button aies-button type="button" variant="ghost" (click)="clearAll()">
            Clear all
          </button>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Collapse"
        hint="When the same error fires repeatedly, toasts stack into one group with a count instead of flooding the corner."
        [code]="stackCode"
      >
        <button aies-button type="button" variant="danger" (click)="spamError()">
          Repeat same error
        </button>
      </app-demo-section>

      <app-demo-section
        title="HTTP tagging"
        hint="Tag real requests with withToast() so success/error toasts fire automatically. These buttons only simulate that bridge."
        [code]="httpCode"
      >
        <div class="flex flex-wrap gap-2">
          <button aies-button type="button" (click)="simulateOk()">
            As if success
          </button>
          <button aies-button type="button" variant="danger" (click)="simulateFail()">
            As if error
          </button>
          <button
            aies-button
            type="button"
            variant="secondary"
            (click)="simulateSilentOk()"
          >
            Success toast off
          </button>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ToastPage {
  private readonly toast = inject(ToastService);

  protected readonly variantsCode = TOAST_VARIANTS;
  protected readonly stackCode = TOAST_STACK;
  protected readonly httpCode = TOAST_HTTP;

  protected showInfo(): void {
    this.toast.info('Cutoff is in 2 hours for this lane.', 'Reminder');
  }

  protected showSuccess(): void {
    this.toast.success('Shipment saved', 'Done');
  }

  protected showWarning(): void {
    this.toast.warning('Rates may be outdated. Refresh before quoting.');
  }

  protected showError(): void {
    this.toast.error('Could not reach the carrier API.', 'Request failed');
  }

  protected showManyErrors(): void {
    for (const name of [
      'FedEx',
      'UPS',
      'DHL',
      'USPS',
      'OnTrac',
      'LaserShip',
      'Amazon',
      'XPO',
    ]) {
      this.toast.error(`Could not reach ${name}.`, 'Request failed');
    }
  }

  protected clearAll(): void {
    this.toast.clear();
  }

  protected spamError(): void {
    this.toast.error('Warehouse offline', 'Sync failed');
  }

  protected simulateOk(): void {
    this.toast.success('Shipment created');
  }

  protected simulateFail(): void {
    this.toast.error('Could not create shipment', 'Request failed');
  }

  protected simulateSilentOk(): void {
    this.toast.info('Finished with withToast({ success: false }) — no success toast.');
  }
}
