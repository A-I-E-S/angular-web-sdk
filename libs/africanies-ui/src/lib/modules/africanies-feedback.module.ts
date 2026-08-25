import { NgModule } from '@angular/core';

import { AlertComponent } from '../alert';
import { ChipComponent } from '../chip';
import {
  AsyncStateComponent,
  EmptyStateComponent,
  ErrorIndicatorComponent,
  ErrorStateComponent,
  LoadingStateComponent,
} from '../feedback';

const FEEDBACK = [
  LoadingStateComponent,
  ErrorStateComponent,
  ErrorIndicatorComponent,
  EmptyStateComponent,
  AsyncStateComponent,
  AlertComponent,
  ChipComponent,
] as const;

/**
 * Async feedback states, inline alert, and status chips.
 *
 * Toast stays out of this module — register {@link provideAfricaniesToasts} instead.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AfricaniesFeedbackModule],
 * })
 * export class ListPageModule {}
 * ```
 */
@NgModule({
  imports: [...FEEDBACK],
  exports: [...FEEDBACK],
})
export class AfricaniesFeedbackModule {}
