// Playground snippet modules — copy-paste implementation guides for aies-button.

export /**
 *
 */
const BUTTON_VARIANTS = `// Intent
// Show the four visual variants of aies-button and how primary follows shipping mode
// (SFN export green / STN import orange via ModeColorService inside ButtonComponent).
//
// Prerequisites
// - Import ButtonComponent in the standalone component imports array.
// - Theme + mode wiring from @aies/aies-theme (provideAiesSdk / shipmentModeInterceptor
//   in production; playground sidebar toggles mode for preview).
//
// Do
// - Use native <button type="button"> for actions; one primary CTA per toolbar/dialog.
// - Set variant explicitly in product UI so intent is obvious in code review.
// - Rely on ButtonComponent for mode-aware primary styling — do not hard-code green/orange.
//
// Don't
// - Nest <button> inside another interactive element.
// - Use primary for destructive actions — use variant="danger".
// - Duplicate ModeColorService logic in feature code; the directive handles it.

import { Component } from '@angular/core';
import {
  ButtonComponent,
  type ButtonVariant,
} from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-actions',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div class="flex flex-wrap items-end gap-6">
      @for (v of variants; track v) {
        <div class="flex flex-col gap-2">
          <span class="text-caption text-neutral-600">{{ v }}</span>
          <button aies-button type="button" [variant]="v">
            {{ labels[v] }}
          </button>
        </div>
      }
    </div>
  \`,
})
export class ShipmentActionsComponent {
  // Canonical variant set — matches ButtonVariant union in @aies/aies-ui.
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
    'danger',
  ];

  // Domain labels per variant — primary reads as the main forward action.
  protected readonly labels: Record<ButtonVariant, string> = {
    primary: 'Save shipment',
    secondary: 'Save draft',
    ghost: 'Cancel',
    danger: 'Delete',
  };
}`;

export /**
 *
 */
const BUTTON_SIZES = `// Intent
// Demonstrate sm | md | lg sizing for dense toolbars vs hero CTAs.
//
// Prerequisites
// - ButtonComponent imported; size defaults to md when omitted.
//
// Do
// - Use sm in table toolbars, dialog footers, and inline row actions.
// - Use lg sparingly for landing / empty-state hero CTAs.
// - Keep label copy short at sm — truncation fights min-height tokens.
//
// Don't
// - Mix sizes arbitrarily within one button group — pick one density per strip.
// - Override min-height with ad-hoc CSS; size tokens encode touch targets.

import { Component } from '@angular/core';
import {
  ButtonComponent,
  type ButtonSize,
} from '@aies/aies-ui';

@Component({
  selector: 'app-button-sizes',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div class="flex flex-wrap items-end gap-6">
      @for (s of sizes; track s) {
        <div class="flex flex-col gap-2">
          <span class="text-caption text-neutral-600">size={{ s }}</span>
          <button aies-button type="button" [size]="s">
            Continue
          </button>
        </div>
      }
    </div>
  \`,
})
export class ButtonSizesComponent {
  protected readonly sizes: ButtonSize[] = ['sm', 'md', 'lg'];
}`;

export /**
 *
 */
const BUTTON_MATRIX = `// Intent
// Render the full variant × size matrix for QA / design review surfaces.
//
// Prerequisites
// - ButtonVariant and ButtonSize types from @aies/aies-ui.
//
// Do
// - Drive both axes from typed arrays so the matrix stays in sync with the design system.
// - Use this pattern in Storybook/playground only — product screens pick one combo per action.
//
// Don't
// - Ship a variant×size picker to end users unless it is an admin theme tool.

import { Component } from '@angular/core';
import {
  ButtonComponent,
  type ButtonSize,
  type ButtonVariant,
} from '@aies/aies-ui';

@Component({
  selector: 'app-button-matrix',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
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
  \`,
})
export class ButtonMatrixComponent {
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
    'danger',
  ];
  protected readonly sizes: ButtonSize[] = ['sm', 'md', 'lg'];
}`;

export /**
 *
 */
const BUTTON_ICONS = `// Intent
// Project aies-icon inside the button host — icon + label share one focus ring.
//
// Prerequisites
// - AiesIconComponent from @aies/aies-icons alongside ButtonComponent.
// - Icon size 14–16px for sm/md buttons; match visual weight to text-body-sm/body.
//
// Do
// - Place icon before label for LTR action semantics (Create, Filter, Delete).
// - Size icons down one step on sm buttons ([size]="14" vs 16).
// - Keep icon name stable — registry lives in @aies/aies-icons.
//
// Don't
// - Wrap icon in an extra span with pointer-events — the host button handles clicks.
// - Use icon-only buttons without aria-label on the host.

import { Component } from '@angular/core';
import { AiesIconComponent } from '@aies/aies-icons';
import { ButtonComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-button-icons',
  standalone: true,
  imports: [ButtonComponent, AiesIconComponent],
  template: \`
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
  \`,
})
export class ButtonIconsComponent {}`;

export /**
 *
 */
const BUTTON_LINKS = `// Intent
// Apply aies-button on anchors for navigation-shaped CTAs (same styling as buttons).
//
// Prerequisites
// - RouterLink / RouterLinkActive when using in-app routes.
// - ButtonComponent still required in imports — attribute directive lives on the host.
//
// Do
// - Use <a aies-button routerLink="..."> for in-app navigation CTAs.
// - Use href for external or hash-only links.
// - Keep variant/size attributes identical to button usage.
//
// Don't
// - Use routerLink on <button> — use (click) + Router.navigate for imperative nav.
// - Forget focus styles — the directive applies the same focus-visible ring as buttons.

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-button-links',
  standalone: true,
  imports: [ButtonComponent, RouterLink],
  template: \`
    <div class="flex flex-wrap gap-3">
      <a aies-button routerLink="/shipments/new" variant="primary">
        Primary link
      </a>

      <a aies-button routerLink="/drafts" variant="secondary" size="sm">
        Secondary link
      </a>

      <a aies-button href="/help/getting-started" variant="ghost">
        Ghost link
      </a>
    </div>
  \`,
})
export class ButtonLinksComponent {}`;

export /**
 *
 */
const BUTTON_DISABLED = `// Intent
// Disable activation on buttons and links — native disabled vs aria-disabled.
//
// Prerequisites
// - ButtonComponent maps [disabled] to aria-disabled + tabindex=-1 on anchors.
//
// Do
// - Bind [disabled]="busy()" or [disabled]="form.invalid" on <button> hosts.
// - On anchors, prefer [disabled]="true" input (booleanAttribute) — directive sets aria-disabled.
// - Disable all actions in a submitting dialog footer while the mutation runs.
//
// Don't
// - Rely on CSS pointer-events alone — use the disabled input for a11y + keyboard block.
// - Leave enabled Cancel open while primary submit is in flight unless UX requires it.

import { Component, signal } from '@angular/core';
import { ButtonComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-button-disabled',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div class="flex flex-wrap gap-3">
      <button aies-button type="button" variant="primary" [disabled]="saving()">
        {{ saving() ? 'Saving…' : 'Save shipment' }}
      </button>

      <button aies-button type="button" variant="secondary" disabled>
        Secondary
      </button>

      <button aies-button type="button" variant="ghost" disabled>
        Ghost
      </button>

      <button aies-button type="button" variant="danger" disabled>
        Danger
      </button>

      <a aies-button href="/shipments" variant="ghost" [disabled]="saving()">
        Ghost link
      </a>
    </div>
  \`,
})
export class ButtonDisabledComponent {
  // Mirror mutation in-flight from your API layer (TanStack mutation.isPending(), etc.).
  protected readonly saving = signal(false);
}`;

export /**
 *
 */
const BUTTON_CONTEXT = `// Intent
// Typical dialog / detail toolbar: ghost cancel, secondary draft, primary submit.
// Primary accent follows active shipping mode (SFN green / STN orange).
//
// Prerequisites
// - ModeColorService is injected inside ButtonComponent — no feature wiring needed.
// - Playground: toggle SFN/STN in the sidebar to preview primary color shift.
//
// Do
// - Order actions cancel → secondary → primary (low → high emphasis, end-aligned).
// - Use size="sm" in compact chrome (drawers, sticky footers, detail headers).
// - Wire (click) handlers to command methods — keep templates declarative.
//
// Don't
// - Place danger variant in the same group as primary without intentional spacing.
// - Hard-code export/import colors on primary — ModeColorService owns that mapping.

import { Component, inject, signal } from '@angular/core';
import { ModeColorService } from '@aies/aies-theme';
import { ButtonComponent } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-toolbar',
  standalone: true,
  imports: [ButtonComponent],
  template: \`
    <div
      class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background-welcome px-4 py-3 dark:border-white/10 dark:bg-ink-950"
    >
      <div>
        <p class="m-0 text-body font-medium text-ink dark:text-white">
          Shipment {{ ref() }}
        </p>
        <p class="m-0 text-caption text-neutral-600">
          Draft · {{ route() }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button aies-button type="button" variant="ghost" size="sm" (click)="cancel()">
          Cancel
        </button>

        <button
          aies-button
          type="button"
          variant="secondary"
          size="sm"
          [disabled]="saving()"
          (click)="saveDraft()"
        >
          Save draft
        </button>

        <button
          aies-button
          type="button"
          variant="primary"
          size="sm"
          [disabled]="saving()"
          (click)="submit()"
        >
          Submit
        </button>
      </div>
    </div>
  \`,
})
export class ShipmentToolbarComponent {
  // Optional: read mode in feature chrome (badges, headings) — primary button already reacts.
  protected readonly modeColor = inject(ModeColorService);

  protected readonly ref = signal('SFN-1042');
  protected readonly route = signal('Lagos → London');
  protected readonly saving = signal(false);

  protected cancel(): void {
    // Navigate away or close parent overlay ref.
  }

  protected saveDraft(): void {
    this.saving.set(true);
    // POST draft → finalize in subscribe/finalize and set saving false.
  }

  protected submit(): void {
    this.saving.set(true);
    // POST submit → on success close overlay or navigate to detail.
  }
}`;
