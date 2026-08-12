import { NgModule } from '@angular/core';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import { ButtonComponent } from '../button';
import { CopyButtonComponent } from '../copy-button';

const ACTIONS = [
  ButtonComponent,
  CopyButtonComponent,
  ActionMenuComponent,
  ActionMenuTriggerDirective,
] as const;

/**
 * Button, copy-to-clipboard control, and overflow action menu.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesActionsModule],
 * })
 * export class ToolbarModule {}
 * ```
 */
@NgModule({
  imports: [...ACTIONS],
  exports: [...ACTIONS],
})
export class AiesActionsModule {}
