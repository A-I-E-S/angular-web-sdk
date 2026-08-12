import { NgModule } from '@angular/core';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import { AvatarComponent, AvatarMenuComponent } from '../avatar';
import { ButtonComponent } from '../button';
import { CopyButtonComponent } from '../copy-button';

const ACTIONS = [
  ButtonComponent,
  CopyButtonComponent,
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  AvatarComponent,
  AvatarMenuComponent,
] as const;

/**
 * Button, copy-to-clipboard control, overflow action menu, and avatar menu.
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
