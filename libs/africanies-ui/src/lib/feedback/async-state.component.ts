import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import type { AsyncQueryStateModel } from '@africanies/africanies-models';

import { AfricaniesUiI18n } from '../i18n/africanies-ui-i18n';
import { EmptyStateComponent } from './empty-state.component';
import { ErrorIndicatorComponent } from './error-indicator.component';
import { ErrorStateComponent } from './error-state.component';
import { LoadingStateComponent } from './loading-state.component';

/**
 * View-model branch for {@link AsyncStateComponent} render order.
 *
 * Kept internal — consumers only pass {@link AsyncQueryStateModel}.
 */
type AsyncView =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'content'; staleError: boolean; fetching: boolean };

/**
 * Async query wrapper that maps {@link AsyncQueryStateModel} into loading / error /
 * empty / success with non-blocking badges for background activity.
 *
 * Render order (blocking first):
 * 1. `isLoading` → {@link LoadingStateComponent}
 * 2. `isError && data === undefined` → {@link ErrorStateComponent}
 * 3. empty data (empty array, or null/undefined after load) → {@link EmptyStateComponent}
 * 4. otherwise project content; never block on background refetch (hosts can
 *    spin their own control, e.g. table Refresh). Keep a stale-error badge if
 *    the last refresh failed.
 *
 * A single `retry` output covers blocking error/empty and the stale-data badge
 * so views wire one handler regardless of which branch fired.
 *
 * @typeParam T - Successful data shape mirrored from the query layer.
 *
 * @example
 * ```ts
 * // Map TanStack Query injectQuery() signals into AsyncQueryStateModel
 * readonly query = injectQuery(() => ({ … }));
 *
 * readonly state = computed<AsyncQueryStateModel<Shipment[]>>(() => ({
 *   data: this.query.data(),
 *   isLoading: this.query.isLoading(),
 *   isFetching: this.query.isFetching(),
 *   isError: this.query.isError(),
 *   error: this.query.error()?.message ?? null,
 * }));
 * ```
 * ```html
 * <africanies-async-state [state]="state()" (retry)="query.refetch()">
 *   <africanies-table [rows]="state().data!" />
 * </africanies-async-state>
 * ```
 */
@Component({
  selector: 'africanies-async-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    ErrorIndicatorComponent,
    ErrorStateComponent,
    LoadingStateComponent,
  ],
  template: `
    @switch (view().kind) {
      @case ('loading') {
        <africanies-loading-state [message]="loadingLabel()" />
      }
      @case ('error') {
        <africanies-error-state
          [message]="errorMessage()"
          [refreshing]="state().isFetching"
          (retry)="retry.emit()"
        />
      }
      @case ('empty') {
        <africanies-empty-state
          [message]="resolvedEmptyMessage()"
          [refreshing]="state().isFetching"
          (retry)="retry.emit()"
        />
      }
      @case ('content') {
        <div class="flex flex-col gap-3">
          @if (contentBadges(); as badges) {
            @if (badges.staleError) {
              <div class="flex justify-end">
                <africanies-error-indicator
                  class="max-w-[min(100%,20rem)]"
                  [error]="staleErrorCopy()"
                  [retryText]="refreshLabel()"
                  [refreshingText]="resolvedStaleRefreshingText()"
                  [refreshing]="badges.fetching"
                  (retry)="retry.emit()"
                />
              </div>
            }
          }
          <ng-content />
        </div>
      }
    }
  `,
})
/**
 * Async query wrapper that maps {@link AsyncQueryStateModel} into loading / error / empty / success with non-blocking badges for background activity.
 */
export class AsyncStateComponent<T = unknown> {
  private readonly i18n = inject(AfricaniesUiI18n);

  /**
   * Snapshot from the app's query layer (e.g. mapped `injectQuery()` signals).
   */
  readonly state = input.required<AsyncQueryStateModel<T>>();

  /**
   * Optional override for the blocking empty copy.
   */
  readonly emptyMessage = input<string | undefined>(undefined);

  /**
   * Copy for the non-blocking stale-data error pill (data present, refresh failed).
   */
  readonly staleErrorMessage = input<string | undefined>(undefined);

  /**
   * Retry label on the stale pill while a background refetch is in flight.
   */
  readonly staleRefreshingText = input<string | undefined>(undefined);

  /**
   * Single retry channel for error, empty, and stale-data badge actions.
   *
   * Always wire a handler — omitting `(retry)` is a misuse of the nested
   * error/empty states.
   */
  readonly retry = output<void>();

  protected readonly loadingLabel = computed(() =>
    this.i18n.t('africaniesUi.feedback.loading', 'Loading…'),
  );

  protected readonly refreshLabel = computed(() =>
    this.i18n.t('africaniesUi.feedback.refresh', 'Refresh'),
  );

  protected readonly resolvedEmptyMessage = computed(
    () =>
      this.emptyMessage() ??
      this.i18n.t('africaniesUi.feedback.empty', 'No results found.'),
  );

  protected readonly resolvedStaleRefreshingText = computed(
    () =>
      this.staleRefreshingText() ??
      this.i18n.t('africaniesUi.feedback.refreshing', 'Refreshing…'),
  );

  /** Resolved blocking error message with a safe fallback. */
  protected readonly errorMessage = computed(
    () =>
      this.state().error ??
      this.i18n.t(
        'africaniesUi.feedback.somethingWentWrong',
        'Something went wrong.',
      ),
  );

  /**
   * Stale pill copy — prefers the query error string, then {@link staleErrorMessage}.
   */
  protected readonly staleErrorCopy = computed(() => {
    const fromState = this.state().error?.trim();
    if (fromState) {
      return fromState;
    }
    return (
      this.staleErrorMessage() ??
      this.i18n.t(
        'africaniesUi.feedback.staleError',
        'Failed to fetch the most recent data.',
      )
    );
  });

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
