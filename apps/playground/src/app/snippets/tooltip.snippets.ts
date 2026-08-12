/**
 * Playground snippets — tooltip.
 */

export /**
 *
 */
const TOOLTIP_DEFAULT = `
// Help next to a label. Ghost info icon; opens on hover, focus, or tap.
// No overlay provider needed — uses CDK like select / action-menu.

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
 *
 */
const TOOLTIP_CUSTOM_TRIGGER = `
// Wrap any control and mark it with aiesTooltipTrigger — default info icon hides.

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
 *
 */
const TOOLTIP_PLACEMENT = `
// placement prefers a side; CDK flips if there’s no room.
// 'top' | 'bottom' | 'left' | 'right' (default 'top').

<aies-tooltip text="Opens above when possible." placement="top" />
<aies-tooltip text="Opens below when possible." placement="bottom" />
<aies-tooltip text="Opens to the left." placement="left" />
<aies-tooltip text="Opens to the right." placement="right" />
`;

export /**
 *
 */
const TOOLTIP_FORM_LABEL = `
// Label + tip beside it — don’t wrap the input itself.

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
