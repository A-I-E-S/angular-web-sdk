import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import type { AsyncQueryState } from '@aies/aies-models';
import { ModeColorService } from '@aies/aies-theme';

import { ButtonComponent } from '../button/button.component';
import { EmptyStateComponent } from './empty-state.component';
import { ErrorStateComponent } from './error-state.component';
import { LoadingStateComponent } from './loading-state.component';

/**
 * View-model branch for {@link AsyncStateComponent} render order.
 *
 * Kept internal — consumers only pass {@link AsyncQueryState}.
 */
type AsyncView =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'content'; staleError: boolean; fetching: boolean };

/**
 * Async query wrapper that maps {@link AsyncQueryState} into loading / error /
 * empty / success with non-blocking badges for background activity.
 *
 * Render order (blocking first):
 * 1. `isLoading` → {@link LoadingStateComponent}
 * 2. `isError && data === undefined` → {@link ErrorStateComponent}
 * 3. empty data (empty array, or null/undefined after load) → {@link EmptyStateComponent}
 * 4. otherwise project content; never block on background refetch — show a
 *    stale-error or "Updating…" badge instead.
 *
 * A single `retry` output covers blocking error/empty and the stale-data badge
 * so views wire one handler regardless of which branch fired.
 *
 * @typeParam T - Successful data shape mirrored from the query layer.
 *
 * @example
 * ```ts
 * // Map TanStack Query injectQuery() signals into AsyncQueryState
 * readonly query = injectQuery(() => ({ … }));
 *
 * readonly state = computed<AsyncQueryState<Shipment[]>>(() => ({
 *   data: this.query.data(),
 *   isLoading: this.query.isLoading(),
 *   isFetching: this.query.isFetching(),
 *   isError: this.query.isError(),
 *   error: this.query.error()?.message ?? null,
 * }));
 * ```
 * ```html
 * <aies-async-state [state]="state()" (retry)="query.refetch()">
 *   <aies-table [rows]="state().data!" />
 * </aies-async-state>
 * ```
 */
@Component({
  selector: 'aies-async-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  template: `
    @switch (view().kind) {
      @case ('loading') {
        <aies-loading-state message="Loading…" />
      }
      @case ('error') {
        <aies-error-state [message]="errorMessage()" (retry)="retry.emit()" />
      }
      @case ('empty') {
        <aies-empty-state [message]="emptyMessage()" (retry)="retry.emit()" />
      }
      @case ('content') {
        <div class="relative">
          @if (contentBadges(); as badges) {
            @if (badges.staleError) {
              <div
                class="absolute top-3 right-3 z-10 inline-flex max-w-[min(100%-1.5rem,20rem)] items-center gap-2 rounded-md border border-warning/40 bg-warning-subtle px-2.5 py-1.5 text-caption text-ink shadow-sm dark:border-warning/50 dark:bg-ink dark:text-white"
                role="status"
              >
                <span class="min-w-0 leading-snug"
                  >Showing saved data — last refresh failed</span
                >
                <button
                  aies-button
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="retry.emit()"
                >
                  Retry
                </button>
              </div>
            } @else if (badges.fetching) {
              <div
                class="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-2.5 py-1.5 text-caption text-neutral-600 shadow-sm dark:border-white/15 dark:bg-ink dark:text-neutral-300"
                role="status"
                aria-live="polite"
              >
                <span
                  class="size-1.5 animate-pulse rounded-full"
                  [class]="modeColor.classes().bg"
                  aria-hidden="true"
                ></span>
                Updating…
              </div>
            }
          }
          <ng-content />
        </div>
      }
    }
  `,
})
export class AsyncStateComponent<T = unknown> {
  protected readonly modeColor = inject(ModeColorService);

  /**
   * Snapshot from the app's query layer (e.g. mapped `injectQuery()` signals).
   */
  readonly state = input.required<AsyncQueryState<T>>();

  /**
   * Optional override for the blocking empty copy.
   */
  readonly emptyMessage = input('No results found.');

  /**
   * Single retry channel for error, empty, and stale-data badge actions.
   *
   * Always wire a handler — omitting `(retry)` is a misuse of the nested
   * error/empty states.
   */
  readonly retry = output<void>();

  /** Resolved blocking error message with a safe fallback. */
  protected readonly errorMessage = computed(
    () => this.state().error ?? 'Something went wrong.',
  );

  /**
   * Derived branch — computed so OnPush templates only re-evaluate when
   * `state` inputs change.
   */
  protected readonly view = computed((): AsyncView => {
    const s = this.state();

    if (s.isLoading) {
      return { kind: 'loading' };
    }

    if (s.isError && s.data === undefined) {
      return { kind: 'error', message: s.error ?? 'Something went wrong.' };
    }

    if (isEmptyData(s.data)) {
      return { kind: 'empty' };
    }

    return {
      kind: 'content',
      // Stale error: we have data, but the latest refetch failed.
      staleError: s.isError,
      // Background fetch only — initial load already returned above.
      fetching: s.isFetching,
    };
  });

  /**
   * Badge flags when showing projected content — separate computed so the
   * template can narrow without union-property errors.
   */
  protected readonly contentBadges = computed(() => {
    const v = this.view();
    return v.kind === 'content'
      ? { staleError: v.staleError, fetching: v.fetching }
      : null;
  });
}

/**
 * Treats missing / null / empty-array payloads as empty UI.
 *
 * WHY include `null`: some APIs use null as "no entity"; arrays are the
 * common list empty sentinel. Non-array objects are considered present even
 * when empty `{}` so detail views are not forced into EmptyState.
 * @param data - Payload under consideration.
 * @returns True when the UI should show the empty state.
 */
function isEmptyData(data: unknown): boolean {
  if (data === undefined || data === null) {
    return true;
  }
  if (Array.isArray(data) && data.length === 0) {
    return true;
  }
  return false;
}
