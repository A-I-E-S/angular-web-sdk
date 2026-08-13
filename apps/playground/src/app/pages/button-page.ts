import { Component } from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import {
  ButtonComponent,
  type ButtonSize,
  type ButtonVariant,
  CopyButtonComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { VariantLabelComponent } from '../shared/variant-label.component';
import {
  BUTTON_CONTEXT,
  BUTTON_COPY,
  BUTTON_DISABLED,
  BUTTON_ICONS,
  BUTTON_LINKS,
  BUTTON_MATRIX,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
} from '../snippets';

/**
 *
 */
@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [
    ButtonComponent,
    CopyButtonComponent,
    AiesIconComponent,
    PageHeaderComponent,
    DemoSectionComponent,
    VariantLabelComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Button"
        description="Primary CTAs, secondary actions, and ghost/danger controls. Use the aies-button attribute on a native button or anchor. Primary color follows shipping mode — Export (SFN) green or Import (STN) orange."
      />

      <app-demo-section
        title="Variants"
        hint="Pick the visual weight for the action. Primary is mode-colored — flip STN/SFN in the sidebar to see it change."
        badge="4"
        [code]="variantsCode"
      >
        <div class="flex flex-wrap items-end gap-6">
          @for (v of variants; track v) {
            <app-variant-label [label]="v">
              <button aies-button type="button" [variant]="v">{{ labels[v] }}</button>
            </app-variant-label>
          }
        </div>
      </app-demo-section>

      <app-demo-section
        title="Sizes"
        hint="sm for dense toolbars and table actions; md for forms; lg when the button is the main call to action."
        [code]="sizesCode"
      >
        <div class="flex flex-wrap items-end gap-6">
          @for (s of sizes; track s) {
            <app-variant-label [label]="'size=' + s">
              <button aies-button type="button" [size]="s">Continue</button>
            </app-variant-label>
          }
        </div>
      </app-demo-section>

      <app-demo-section title="Variant × size matrix" hint="Every variant at every size — useful when checking density in a toolbar vs a dialog footer." muted [code]="matrixCode">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="text-caption text-neutral-600">
                <th class="pb-3 pr-4 font-medium">Variant</th>
                @for (s of sizes; track s) {
                  <th class="pb-3 pr-4 font-medium">{{ s }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (v of variants; track v) {
                <tr class="border-t border-border dark:border-white/10">
                  <td class="py-3 pr-4 text-body-sm text-neutral-600">{{ v }}</td>
                  @for (s of sizes; track s) {
                    <td class="py-3 pr-4">
                      <button aies-button type="button" [variant]="v" [size]="s">
                        Action
                      </button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-demo-section>

      <app-demo-section
        title="With icons"
        hint="Place an aies-icon inside the button for create, filter, and similar actions."
        [code]="iconsCode"
      >
        <div class="flex flex-wrap gap-3">
          <button aies-button type="button" variant="primary">
            <aies-icon name="airplane" [size]="16" />
            Create shipment
          </button>
          <button aies-button type="button" variant="secondary">
            <aies-icon name="adjust" [size]="16" />
            Filters
          </button>
          <button aies-button type="button" variant="ghost" size="sm">
            <aies-icon name="warehouse" [size]="14" />
            Warehouse
          </button>
          <button aies-button type="button" variant="danger" size="sm">
            <aies-icon name="warning" [size]="14" />
            Void
          </button>
        </div>
      </app-demo-section>

      <app-demo-section
        title="As links"
        hint="Same styles on <a> when the control should navigate instead of run an action."
        [code]="linksCode"
      >
        <div class="flex flex-wrap gap-3">
          <a aies-button href="#primary" variant="primary">Primary link</a>
          <a aies-button href="#secondary" variant="secondary" size="sm">Secondary link</a>
          <a aies-button href="#ghost" variant="ghost">Ghost link</a>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Disabled"
        hint="Unavailable actions. Native buttons use disabled; anchors use aria-disabled so they stay in the tab order safely."
        [code]="disabledCode"
      >
        <div class="flex flex-wrap gap-3">
          <button aies-button type="button" variant="primary" disabled>Primary</button>
          <button aies-button type="button" variant="secondary" disabled>Secondary</button>
          <button aies-button type="button" variant="ghost" disabled>Ghost</button>
          <button aies-button type="button" variant="danger" disabled>Danger</button>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Copy to clipboard"
        hint="aies-copy for IDs, tracking numbers, and snippets. Icon-only or labeled; shows a check briefly after a successful copy."
        [code]="copyCode"
      >
        <div class="flex flex-wrap items-center gap-4">
          <code
            class="rounded-md bg-border/60 px-2.5 py-1.5 font-mono text-caption text-ink dark:bg-white/10 dark:text-white"
          >
            {{ copyReference }}
          </code>
          <aies-copy [value]="copyReference" ariaLabel="Copy reference" />
          <aies-copy
            [value]="copySnippet"
            label="Copy snippet"
            [announce]="true"
          />
        </div>
      </app-demo-section>

      <app-demo-section
        title="In context"
        hint="Typical page toolbar: primary create on the left, secondary utilities on the right."
        [code]="contextCode"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background-welcome px-4 py-3 dark:border-white/10 dark:bg-ink-950"
        >
          <div>
            <p class="m-0 text-body font-medium text-ink dark:text-white">Shipment SFN-1042</p>
            <p class="m-0 text-caption text-neutral-600">Draft · Lagos → London</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button aies-button type="button" variant="ghost" size="sm">Cancel</button>
            <button aies-button type="button" variant="secondary" size="sm">Save draft</button>
            <button aies-button type="button" variant="primary" size="sm">Submit</button>
          </div>
        </div>
      </app-demo-section>
    </div>
  `,
})
export class ButtonPage {
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
    'danger',
  ];
  protected readonly sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  protected readonly labels: Record<ButtonVariant, string> = {
    primary: 'Save shipment',
    secondary: 'Save draft',
    ghost: 'Cancel',
    danger: 'Delete',
  };

  protected readonly variantsCode = BUTTON_VARIANTS;
  protected readonly sizesCode = BUTTON_SIZES;
  protected readonly matrixCode = BUTTON_MATRIX;
  protected readonly iconsCode = BUTTON_ICONS;
  protected readonly linksCode = BUTTON_LINKS;
  protected readonly disabledCode = BUTTON_DISABLED;
  protected readonly contextCode = BUTTON_CONTEXT;
  protected readonly copyCode = BUTTON_COPY;

  protected readonly copyReference = 'SFN-1042';
  protected readonly copySnippet = '<aies-icon name="airplane" />';
}
