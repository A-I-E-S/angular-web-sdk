import { Component, signal } from '@angular/core';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  type AiesMenuItem,
  ButtonComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  ACTION_MENU_CUSTOM,
  ACTION_MENU_DEFAULT,
  ACTION_MENU_DISABLED,
  ACTION_MENU_VARIANTS,
} from '../snippets';

/**
 *
 */
@Component({
  selector: 'app-action-menu-page',
  standalone: true,
  imports: [
    ActionMenuComponent,
    ActionMenuTriggerDirective,
    ButtonComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Action menu"
        description="Overflow menu for row and toolbar actions. CDK overlay (not clipped by table overflow). Default ellipsis trigger or a custom aiesActionMenuTrigger."
      />

      <app-demo-section
        title="Default trigger"
        hint="Default ellipsis — the usual table row actions trigger."
        [code]="defaultCode"
      >
        <div class="flex flex-wrap items-center gap-4">
          <aies-action-menu [items]="demoItems" />
          <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
            Last action:
            <span class="font-medium text-ink dark:text-white">{{
              lastAction() ?? '—'
            }}</span>
          </p>
        </div>
      </app-demo-section>

      <app-demo-section
        title="Custom trigger"
        hint="Point aiesActionMenuTrigger at your own button."
        [code]="customCode"
      >
        <aies-action-menu [items]="demoItems" ariaLabel="Shipment actions">
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
      </app-demo-section>

      <app-demo-section
        title="Danger, disabled, divider"
        hint="dividerBefore adds a rule; danger styles destructive actions."
        [code]="variantsCode"
      >
        <aies-action-menu [items]="variantItems" />
      </app-demo-section>

      <app-demo-section
        title="Disabled menu"
        hint="Disabled host means the menu will not open."
        [code]="disabledCode"
      >
        <aies-action-menu [items]="demoItems" [disabled]="true" />
      </app-demo-section>
    </div>
  `,
})
export class ActionMenuPage {
  protected readonly lastAction = signal<string | null>(null);

  protected readonly demoItems: AiesMenuItem[] = [
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

  protected readonly variantItems: AiesMenuItem[] = [
    {
      label: 'Download PDF',
      icon: 'download',
      onClick: () => undefined,
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
      onClick: () => undefined,
    },
  ];

  protected readonly defaultCode = ACTION_MENU_DEFAULT;
  protected readonly customCode = ACTION_MENU_CUSTOM;
  protected readonly variantsCode = ACTION_MENU_VARIANTS;
  protected readonly disabledCode = ACTION_MENU_DISABLED;
}
