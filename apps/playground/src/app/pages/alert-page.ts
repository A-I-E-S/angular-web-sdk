import { Component, signal } from '@angular/core';

import {
  AlertComponent,
  type AlertVariant,
  ButtonComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { ALERT_DISMISSIBLE, ALERT_VARIANTS } from '../snippets';

/**
 *
 */
@Component({
  selector: 'app-alert-page',
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Alert"
        description="Inline dismissible banners (info / success / warning / danger). Parent owns visibility — distinct from ErrorState (async failure + Retry)."
      />

      <app-demo-section
        title="Variants"
        hint="info / success / warning / danger. Warning and danger announce as alerts."
        badge="4"
        [code]="variantsCode"
      >
        <div class="flex flex-col gap-3">
          @for (v of variants; track v) {
            <aies-alert
              [variant]="v"
              [title]="titles[v]"
              [message]="messages[v]"
              [dismissible]="false"
            />
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="Dismissible"
        hint="Dismissible by default — hide it with @if when (dismissed) fires."
        [code]="dismissibleCode"
      >
        <div class="flex flex-col gap-4">
          @if (showBanner()) {
            <aies-alert
              variant="warning"
              title="Rates outdated"
              message="Refresh to pull the latest carrier rates before quoting."
              (dismissed)="showBanner.set(false)"
            >
              <button
                aies-button
                type="button"
                size="sm"
                class="mt-2"
                (click)="onRefresh()"
              >
                Refresh rates
              </button>
            </aies-alert>
          } @else {
            <button
              aies-button
              type="button"
              variant="secondary"
              size="sm"
              (click)="showBanner.set(true)"
            >
              Show banner again
            </button>
          }

          <aies-alert
            variant="info"
            message="This environment is connected to the staging API."
            [dismissible]="false"
          />
        </div>
      </app-demo-section>
    </div>
  `,
})
export class AlertPage {
  protected readonly showBanner = signal(true);

  protected readonly variants: AlertVariant[] = [
    'info',
    'success',
    'warning',
    'danger',
  ];

  protected readonly titles: Record<AlertVariant, string> = {
    info: 'Document checklist',
    success: 'Submitted',
    warning: 'Rates may be stale',
    danger: 'Cannot release',
  };

  protected readonly messages: Record<AlertVariant, string> = {
    info: 'Commercial invoice and packing list are still required.',
    success: 'Shipment SFN-1042 was submitted to the carrier.',
    warning: 'Last rate pull was more than 4 hours ago.',
    danger: 'Customs hold blocks release until documents are approved.',
  };

  protected readonly variantsCode = ALERT_VARIANTS;
  protected readonly dismissibleCode = ALERT_DISMISSIBLE;

  protected onRefresh(): void {
    this.showBanner.set(false);
  }
}
