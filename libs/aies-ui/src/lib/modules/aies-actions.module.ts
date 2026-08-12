import { NgModule } from '@angular/core';

import {
  ActionMenuComponent,
  ActionMenuTriggerDirective,
} from '../action-menu';
import { ButtonComponent } from '../button';

const ACTIONS = [
  ButtonComponent,
  ActionMenuComponent,
  ActionMenuTriggerDirective,
] as const;

/**
 * Button + overflow action menu (and its trigger directive).
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
