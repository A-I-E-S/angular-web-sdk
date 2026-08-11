/**
 * Playground implementation snippets — tooltip.
 */

export /**
 * Default info-icon trigger.
 */
const TOOLTIP_DEFAULT = `
// =============================================================================
// GUIDE — Default icon tooltip
//
// INTENT
//   Drop-in help next to labels or dense UI. Renders a ghost info icon that
//   opens on hover, keyboard focus, and click/tap.
//
// PREREQUISITES
//   Import TooltipComponent from @aies/aies-ui (no overlay provider required —
//   uses CDK connected overlay like select / action-menu).
// =============================================================================

import { TooltipComponent } from '@aies/aies-ui';

@Component({
  imports: [TooltipComponent],
  template: \`
    <div class="inline-flex items-center gap-1.5">
      Insured
      <aies-tooltip
        text="Coverage against loss or damage while the shipment is in transit."
      />
    </div>
  \`,
})
export class Example {}
`;

export /**
 * Custom projected trigger.
 */
const TOOLTIP_CUSTOM_TRIGGER = `
// =============================================================================
// GUIDE — Custom trigger target
//
// INTENT
//   Reuse the tip chrome around any control (link, button, icon). Mark the
//   interactive child with aiesTooltipTrigger — the default info icon hides.
// =============================================================================

import { ButtonComponent, TooltipComponent, TooltipTriggerDirective } from '@aies/aies-ui';

@Component({
  imports: [ButtonComponent, TooltipComponent, TooltipTriggerDirective],
  template: \`
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
  \`,
})
export class Example {}
`;

export /**
 * Placement variants.
 */
const TOOLTIP_PLACEMENT = `
// =============================================================================
// GUIDE — Placement
//
// INTENT
//   placement prefers a side; CDK flips when there is no room.
//   Values: 'top' | 'bottom' | 'left' | 'right' (default 'top').
// =============================================================================

<aies-tooltip text="Opens above when possible." placement="top" />
<aies-tooltip text="Opens below when possible." placement="bottom" />
<aies-tooltip text="Opens to the left." placement="left" />
<aies-tooltip text="Opens to the right." placement="right" />
`;

export /**
 * Form label pattern.
 */
const TOOLTIP_FORM_LABEL = `
// =============================================================================
// GUIDE — Next to a form label
//
// INTENT
//   Typical consuming-app pattern: label + tip without wrapping the input.
// =============================================================================

import { TextInputComponent, TooltipComponent } from '@aies/aies-ui';

@Component({
  imports: [TextInputComponent, TooltipComponent],
  template: \`
    <div class="flex flex-col gap-1.5">
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
      <aies-text-input label="" placeholder="SFN-…" [(value)]="tracking" />
    </div>
  \`,
})
export class Example {
  tracking = '';
}
`;
