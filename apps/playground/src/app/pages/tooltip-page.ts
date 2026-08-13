import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ButtonComponent,
  TextInputComponent,
  TooltipComponent,
  TooltipTriggerDirective,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  TOOLTIP_CUSTOM_TRIGGER,
  TOOLTIP_DEFAULT,
  TOOLTIP_FORM_LABEL,
  TOOLTIP_PLACEMENT,
} from '../snippets';

/**
 * Tooltip demos — default icon, custom trigger, placements, form label.
 */
@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [
    ButtonComponent,
    TextInputComponent,
    TooltipComponent,
    TooltipTriggerDirective,
    PageHeaderComponent,
    DemoSectionComponent,
    RouterLink,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header eyebrow="Components" title="Tooltip">
        <p
          description
          class="m-0 text-body text-neutral-600 dark:text-neutral-400"
        >
          Short help next to a label or control when the UI is dense. Uses a
          <a
            routerLink="/lecture"
            fragment="CDK"
            class="pg-glossary-link"
            >CDK</a
          >
          connected overlay (same pattern as select / action menu). Default info
          icon, or mark your own element with aiesTooltipTrigger. Opens on hover,
          focus, and click/tap.
        </p>
      </app-page-header>

      <app-demo-section
        title="Default icon"
        hint="Drop the default info icon beside a field or label when a one-line explanation is enough."
        subtext="Opens on hover, focus, or tap. Escape or an outside click closes a sticky tip."
        [code]="defaultCode"
      >
        <div class="flex flex-wrap items-center gap-6">
          <div class="inline-flex items-center gap-1.5 text-body text-ink dark:text-white">
            Insured
            <aies-tooltip
              text="Coverage against loss or damage while the shipment is in transit."
            />
          </div>
          <div class="inline-flex items-center gap-1.5 text-body text-ink dark:text-white">
            API request
            <aies-tooltip
              text="Created through the public shipping API rather than the portal UI."
              icon="question-circle"
              ariaLabel="About API request"
            />
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Custom trigger"
        hint="When you need a text link or button instead of the info icon, put aiesTooltipTrigger on that control."
        subtext="Use a focusable trigger (button or link) so keyboard users can open it."
        [code]="customTriggerCode"
      >
        <aies-tooltip text="Required when the declared value exceeds $2,000.">
          <button
            type="button"
            aies-button
            aiesTooltipTrigger
            variant="ghost"
            size="sm"
          >
            Why is this required?
          </button>
        </aies-tooltip>
      </app-demo-section>

      <app-demo-section
        title="Placement"
        hint="Prefer a side that fits the layout; the tip flips automatically if there is no room."
        subtext="top (default), bottom, left, or right."
        [code]="placementCode"
      >
        <div class="flex flex-wrap items-center gap-8 py-6">
          <aies-tooltip text="Opens above when possible." placement="top" />
          <aies-tooltip text="Opens below when possible." placement="bottom" />
          <aies-tooltip text="Opens to the left." placement="left" />
          <aies-tooltip text="Opens to the right." placement="right" />
        </div>
      </app-demo-section>

      <app-demo-section
        title="Next to a form label"
        hint="Common pattern: label + tip on one row, input underneath — keeps long help out of the hint line."
        subtext="Add ariaLabel on the icon when the visible label is not enough for screen readers."
        [code]="formLabelCode"
      >
        <div class="flex max-w-sm flex-col gap-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-body-sm font-medium text-ink dark:text-white">
              Tracking number
            </span>
            <aies-tooltip
              text="Carrier AWB or internal shipment reference used on the warehouse floor."
              icon="question-circle"
              ariaLabel="About tracking number"
            />
          </div>
          <aies-text-input
            label=""
            placeholder="SFN-…"
            [value]="tracking()"
            (valueChange)="tracking.set($event)"
          />
        </div>
      </app-demo-section>
    </div>
  `,
})
export class TooltipPage {
  protected readonly defaultCode = TOOLTIP_DEFAULT;
  protected readonly customTriggerCode = TOOLTIP_CUSTOM_TRIGGER;
  protected readonly placementCode = TOOLTIP_PLACEMENT;
  protected readonly formLabelCode = TOOLTIP_FORM_LABEL;

  protected readonly tracking = signal('');
}
