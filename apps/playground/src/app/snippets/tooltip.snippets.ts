/**
 * Playground snippets — tooltip.
 */

export /**
 *
 */
const TOOLTIP_DEFAULT = `
// Help next to a label. Ghost info icon; opens on hover, focus, or tap.
// No overlay provider needed — uses CDK like select / action-menu.

import { TooltipComponent } from '@africanies/africanies-ui';

@Component({
  imports: [TooltipComponent],
  template: \`
    <div class="inline-flex items-center gap-1.5">
      Insured
      <africanies-tooltip
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
// Wrap any control and mark it with africaniesTooltipTrigger — default info icon hides.

import { ButtonComponent, TooltipComponent, TooltipTriggerDirective } from '@africanies/africanies-ui';

@Component({
  imports: [ButtonComponent, TooltipComponent, TooltipTriggerDirective],
  template: \`
    <africanies-tooltip text="Required when the declared value exceeds $2,000.">
      <button
        type="button"
        africanies-button
        africaniesTooltipTrigger
        variant="ghost"
        size="sm"
      >
        Why is this required?
      </button>
    </africanies-tooltip>
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

<africanies-tooltip text="Opens above when possible." placement="top" />
<africanies-tooltip text="Opens below when possible." placement="bottom" />
<africanies-tooltip text="Opens to the left." placement="left" />
<africanies-tooltip text="Opens to the right." placement="right" />
`;

export /**
 *
 */
const TOOLTIP_FORM_LABEL = `
// Label + tip beside it — don’t wrap the input itself.

import { TextInputComponent, TooltipComponent } from '@africanies/africanies-ui';

@Component({
  imports: [TextInputComponent, TooltipComponent],
  template: \`
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-1.5">
        <span class="text-body-sm font-medium text-ink dark:text-white">
          Tracking number
        </span>
        <africanies-tooltip
          text="Carrier AWB or internal shipment reference used on the warehouse floor."
          icon="question-circle"
          ariaLabel="About tracking number"
        />
      </div>
      <africanies-text-input label="" placeholder="SFN-…" [(value)]="tracking" />
    </div>
  \`,
})
export class Example {
  tracking = '';
}
`;
