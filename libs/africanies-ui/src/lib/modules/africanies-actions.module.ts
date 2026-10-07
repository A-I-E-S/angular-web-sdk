import { NgModule } from '@angular/core';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import { AvatarComponent, AvatarMenuComponent } from '../avatar';
import { ButtonComponent } from '../button';
import { CopyButtonComponent } from '../copy-button';
import { LanguageSwitcherComponent } from '../language-switcher';

const ACTIONS = [
  ButtonComponent,
  CopyButtonComponent,
  ActionMenuComponent,
  ActionMenuTriggerDirective,
  AvatarComponent,
  AvatarMenuComponent,
  LanguageSwitcherComponent,
] as const;

/**
 * Button, copy, overflow menu, avatar menu, and language switcher.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AfricaniesActionsModule],
 * })
 * export class ToolbarModule {}
 * ```
 */
@NgModule({
  imports: [...ACTIONS],
  exports: [...ACTIONS],
})
/**
 * Button, copy, overflow menu, avatar menu, and language switcher.
 */
export class AfricaniesActionsModule {}
