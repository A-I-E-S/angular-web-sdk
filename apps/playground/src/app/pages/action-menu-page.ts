import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
    RouterLink,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header eyebrow="Components" title="Action menu">
        <p
          description
          class="m-0 text-body text-neutral-600 dark:text-neutral-400"
        >
          Overflow (…) menu for row and toolbar actions that do not deserve a full
          button. Uses a
          <a
            routerLink="/lecture"
            fragment="CDK"
            class="pg-glossary-link"
            >CDK</a
          >
          overlay so it is not clipped by table overflow. Default ellipsis
          trigger, or point aiesActionMenuTrigger at your own control.
        </p>
      </app-page-header>

      <app-demo-section
        title="Default trigger"
        hint="Built-in ellipsis — the usual pattern for table row actions."
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
        hint="When ellipsis is not enough — attach aiesActionMenuTrigger to your own labeled button."
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
        hint="Mark destructive items with danger, disable unavailable ones, and use dividerBefore to separate groups."
        [code]="variantsCode"
      >
        <aies-action-menu [items]="variantItems" />
      </app-demo-section>

      <app-demo-section
        title="Disabled menu"
        hint="Disable the whole menu when no actions apply (e.g. row locked or permissions missing)."
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
