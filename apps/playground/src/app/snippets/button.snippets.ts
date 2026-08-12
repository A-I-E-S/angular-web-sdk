// aies-button copy-paste examples.

export /**
 *
 */
const BUTTON_VARIANTS = `// Four variants. Primary picks up SFN green / STN orange from ModeColorService —
// don't hard-code those colors yourself.

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
  protected readonly variants: ButtonVariant[] = [
    'primary',
    'secondary',
    'ghost',
    'danger',
  ];

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
const BUTTON_SIZES = `// sm | md | lg. Default is md. Use sm in toolbars/dialogs; save lg for hero CTAs.

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
const BUTTON_MATRIX = `// Full variant × size grid — handy for QA, not something you'd ship on a product page.

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
const BUTTON_ICONS = `// Drop <aies-icon> inside the button — same focus ring as the label.
// Icon-only? Put aria-label on the host.

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
const BUTTON_LINKS = `// Same look on <a> — use routerLink for in-app, href for external.

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
const BUTTON_DISABLED = `// [disabled] works on buttons and anchors (anchors get aria-disabled + tabindex=-1).
// Bind it to your in-flight mutation flag.

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
  protected readonly saving = signal(false);
}`;

export /**
 *
 */
const BUTTON_CONTEXT = `// Typical toolbar: ghost cancel → secondary draft → primary submit.
// Toggle SFN/STN in the sidebar to see primary shift color.

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
