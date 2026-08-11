/**
 * Playground implementation snippets — action menu (@aies/aies-ui).
 * Each export is a copy-paste-ready guide for consumer apps.
 */

export /**
 *
 */
const ACTION_MENU_DEFAULT = `
// =============================================================================
// INTENT
//   Overflow menu with the built-in ghost ellipsis trigger — typical for table
//   action columns and compact toolbars.
//
// PREREQUISITES
//   @aies/aies-ui (ActionMenuComponent, type AiesMenuItem).
//
// DO
//   - Put side effects on each item's onClick — the menu closes after it runs.
//   - Set ariaLabel when context is not obvious (row menus: include row name).
//   - For table rows, build items in a factory so onClick closes over row.
//
// DON'T
//   - Use a single host (actionSelect) handler with string ids — prefer onClick.
//   - Share one static items array across rows when actions need row context.
//
// CDK OVERLAY
//   The menu panel renders in a CDK overlay attached to the document body, so
//   it is not clipped by table overflow:hidden or scroll containers.
// =============================================================================

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
const ACTION_MENU_CUSTOM = `
// =============================================================================
// INTENT
//   Replace the default ellipsis with any projected control via aiesActionMenuTrigger.
//   Useful for labeled toolbar buttons ("Actions", "More", icon-only custom chrome).
//
// PREREQUISITES
//   @aies/aies-ui (ActionMenuComponent, ActionMenuTriggerDirective, ButtonComponent).
//
// DO
//   - Wrap the trigger button inside <aies-action-menu> content projection.
//   - Add aiesActionMenuTrigger on the clickable element.
//
// DON'T
//   - Nest a second button without the directive — it will not toggle the menu.
//   - Forget type="button" on buttons inside forms.
// =============================================================================

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
const ACTION_MENU_VARIANTS = `
// =============================================================================
// INTENT
//   Item-level styling and interaction: danger destructive actions, disabled
//   rows, and dividerBefore separators between groups.
//
// PREREQUISITES
//   @aies/aies-ui (ActionMenuComponent, type AiesMenuItem).
//
// DO
//   - Set danger: true on destructive actions (delete, void, revoke).
//   - Use dividerBefore: true to separate destructive items from neutral ones.
//   - Set disabled: true on items unavailable for the current row/state.
//
// DON'T
//   - Hide destructive actions silently — disable with explanation in label or
//     omit from items when the user lacks permission (server still validates).
// =============================================================================

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
const ACTION_MENU_DISABLED = `
// =============================================================================
// INTENT
//   Disable the entire menu — blocks opening the default trigger (or custom
//   trigger when used with aiesActionMenuTrigger).
//
// PREREQUISITES
//   @aies/aies-ui (ActionMenuComponent, type AiesMenuItem).
//
// DO
//   - Bind [disabled] from row state (locked record, pending sync, no permission).
//   - Keep items defined — re-enable when state clears.
//
// DON'T
//   - Render an empty items array as a substitute for disabled — use [disabled].
// =============================================================================

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
