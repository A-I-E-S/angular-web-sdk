import { Component, signal } from '@angular/core';
import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  ButtonComponent,
  type AiesMenuItem,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  ACTION_MENU_CUSTOM,
  ACTION_MENU_DEFAULT,
  ACTION_MENU_DISABLED,
  ACTION_MENU_VARIANTS,
} from '../snippets';

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
        hint="Ghost ellipsis button — typical for table action columns."
        [code]="defaultCode"
      >
        <div class="flex flex-wrap items-center gap-4">
          <aies-action-menu
            [items]="demoItems"
            (actionSelect)="onAction($event)"
          />
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
        hint="Project any control with aiesActionMenuTrigger."
        [code]="customCode"
      >
        <aies-action-menu
          [items]="demoItems"
          ariaLabel="Shipment actions"
          (actionSelect)="onAction($event)"
        >
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
        hint="dividerBefore draws a rule above the item; danger uses destructive styling."
        [code]="variantsCode"
      >
        <aies-action-menu
          [items]="variantItems"
          (actionSelect)="onAction($event)"
        />
      </app-demo-section>

      <app-demo-section
        title="Disabled menu"
        hint="Host disabled blocks opening the default trigger."
        [code]="disabledCode"
      >
        <aies-action-menu
          [items]="demoItems"
          [disabled]="true"
          (actionSelect)="onAction($event)"
        />
      </app-demo-section>
    </div>
  `,
})
export class ActionMenuPage {
  protected readonly lastAction = signal<string | null>(null);

  protected readonly demoItems: AiesMenuItem[] = [
    { id: 'open', label: 'Open', icon: 'eye' },
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'copy', label: 'Copy reference', icon: 'copy' },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
    },
  ];

  protected readonly variantItems: AiesMenuItem[] = [
    { id: 'download', label: 'Download PDF', icon: 'download' },
    { id: 'archive', label: 'Archive', disabled: true },
    {
      id: 'void',
      label: 'Void shipment',
      icon: 'trash',
      danger: true,
      dividerBefore: true,
    },
  ];

  protected readonly defaultCode = ACTION_MENU_DEFAULT;
  protected readonly customCode = ACTION_MENU_CUSTOM;
  protected readonly variantsCode = ACTION_MENU_VARIANTS;
  protected readonly disabledCode = ACTION_MENU_DISABLED;

  protected onAction(id: string): void {
    this.lastAction.set(id);
  }
}
