import { NgModule } from '@angular/core';

import { AlertComponent } from '../alert';
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
] as const;

/**
 * Async feedback states + inline alert.
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
