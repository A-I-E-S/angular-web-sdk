// Action menu copy-paste examples.

export /**
 *
 */
const ACTION_MENU_DEFAULT = `// Default ellipsis trigger — good for table rows.
// Put side effects on each item's onClick; the menu closes after it runs.
// Panel renders in a CDK overlay so it won't get clipped by overflow:hidden.

import { Component, signal } from '@angular/core';
import { ActionMenuComponent, type AiesMenuItem } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-row-actions-demo',
  standalone: true,
  imports: [ActionMenuComponent],
  template: \`
    <div class="flex flex-wrap items-center gap-4">
      <aies-action-menu [items]="items" ariaLabel="Shipment actions" />

      <p class="m-0 text-body-sm">
        Last action:
        <span class="font-medium">{{ lastAction() ?? '—' }}</span>
      </p>
    </div>
  \`,
})
export class ShipmentRowActionsDemoComponent {
  protected readonly lastAction = signal<string | null>(null);

  protected readonly items: AiesMenuItem[] = [
    {
      label: 'Open',
      icon: 'eye',
      onClick: () => this.lastAction.set('Open'),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => this.lastAction.set('Edit'),
    },
    {
      label: 'Copy reference',
      icon: 'copy',
      onClick: () => this.lastAction.set('Copy reference'),
    },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.lastAction.set('Delete'),
    },
  ];
}
`;

export /**
 *
 */
const ACTION_MENU_CUSTOM = `// Swap the ellipsis for your own trigger — project it inside and add aiesActionMenuTrigger.

import { Component } from '@angular/core';
import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  ButtonComponent,
  type AiesMenuItem,
} from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-toolbar-actions',
  standalone: true,
  imports: [ActionMenuComponent, ActionMenuTriggerDirective, ButtonComponent],
  template: \`
    <aies-action-menu [items]="items" ariaLabel="Shipment actions">
      <button
        type="button"
        aies-button
        aiesActionMenuTrigger
        variant="secondary"
        size="sm"
      >
        Actions
      </button>
    </aies-action-menu>
  \`,
})
export class ShipmentToolbarActionsComponent {
  protected readonly items: AiesMenuItem[] = [
    {
      label: 'Open',
      icon: 'eye',
      onClick: () => this.open(),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => this.edit(),
    },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.delete(),
    },
  ];

  private open(): void {
    /* navigate or open drawer */
  }

  private edit(): void {
    /* … */
  }

  private delete(): void {
    /* … */
  }
}
`;

export /**
 *
 */
const ACTION_MENU_VARIANTS = `// Item flags: danger for destructive, disabled when unavailable, dividerBefore to separate groups.

import { Component } from '@angular/core';
import { ActionMenuComponent, type AiesMenuItem } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-action-variants',
  standalone: true,
  imports: [ActionMenuComponent],
  template: \`
    <aies-action-menu [items]="items" />
  \`,
})
export class ShipmentActionVariantsComponent {
  protected readonly items: AiesMenuItem[] = [
    {
      label: 'Download PDF',
      icon: 'download',
      onClick: () => this.download(),
    },
    {
      label: 'Archive',
      disabled: true,
      onClick: () => undefined,
    },
    {
      label: 'Void shipment',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.voidShipment(),
    },
  ];

  private download(): void {
    /* … */
  }

  private voidShipment(): void {
    /* … */
  }
}
`;

export /**
 *
 */
const ACTION_MENU_DISABLED = `// [disabled] locks the whole menu (won't open). Prefer this over an empty items array.

import { Component, input } from '@angular/core';
import { ActionMenuComponent, type AiesMenuItem } from '@aies/aies-ui';

@Component({
  selector: 'app-shipment-action-menu-disabled',
  standalone: true,
  imports: [ActionMenuComponent],
  template: \`
    <aies-action-menu [items]="items" [disabled]="menuDisabled()" />
  \`,
})
export class ShipmentActionMenuDisabledComponent {
  // Parent passes true when the row is locked or the user lacks edit rights.
  readonly menuDisabled = input(false);

  protected readonly items: AiesMenuItem[] = [
    {
      label: 'Open',
      icon: 'eye',
      onClick: () => this.open(),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: () => this.edit(),
    },
    {
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
      onClick: () => this.delete(),
    },
  ];

  private open(): void {
    /* not reachable while [disabled]="true" */
  }

  private edit(): void {
    /* … */
  }

  private delete(): void {
    /* … */
  }
}
`;
