import { NgModule } from '@angular/core';

import { AlertComponent } from '../alert';
import { ChipComponent } from '../chip';
import {
  AsyncStateComponent,
  EmptyStateComponent,
  ErrorStateComponent,
  LoadingStateComponent,
} from '../feedback';

const FEEDBACK = [
  LoadingStateComponent,
  ErrorStateComponent,
  EmptyStateComponent,
  AsyncStateComponent,
  AlertComponent,
  ChipComponent,
] as const;

/**
 * Async feedback states, inline alert, and status chips.
 *
 * Toast stays out of this module — register {@link provideAiesToasts} instead.
 *
 * @example
 * ```ts
 * @NgModule({
 *   imports: [AiesFeedbackModule],
 * })
 * export class ListPageModule {}
 * ```
 */
@NgModule({
  imports: [...FEEDBACK],
  exports: [...FEEDBACK],
})
export class AiesFeedbackModule {}
