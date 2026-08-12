import { Component, inject } from '@angular/core';

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
  imports: [ButtonComponent, PageHeaderComponent, DemoSectionComponent],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Toast"
        description="Corner stack for transient feedback. Errors stay until you close them; warnings linger longer; identical messages collapse with a count."
      />

      <app-demo-section
        title="Variants"
        hint="Error is persistent. Warning ~8s. Info / success ~4.5s — hover pauses the countdown."
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
          <button aies-button type="button" variant="ghost" (click)="clearAll()">
            Clear all
          </button>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Collapse"
        hint="Fire the same error a few times. X peels one copy; Expand shows them all; Close all clears the group (or use Expand all / Close all above the stack)."
        [code]="stackCode"
      >
        <button aies-button type="button" variant="danger" (click)="spamError()">
          Repeat same error
        </button>
      </app-demo-section>

      <app-demo-section
        title="HTTP tagging"
        hint="In apps, tag calls with withToast() (see Show code). These buttons mirror what the interceptor would show."
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
