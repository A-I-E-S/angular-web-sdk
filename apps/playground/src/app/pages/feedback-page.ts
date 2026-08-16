import { Component, computed, signal } from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import type { AsyncQueryStateModel } from '@aies/aies-models';
import {
  AsyncStateComponent,
  EmptyStateComponent,
  ErrorIndicatorComponent,
  ErrorStateComponent,
  LoadingStateComponent,
} from '@aies/aies-ui';

import { DemoSectionComponent } from '../shared/demo-section.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import {
  FEEDBACK_ASYNC,
  FEEDBACK_EMPTY,
  FEEDBACK_ERROR,
  FEEDBACK_ERROR_INDICATOR,
  FEEDBACK_LOADING,
} from '../snippets';

type DemoKind =
  | 'loading'
  | 'error'
  | 'empty'
  | 'content'
  | 'fetching'
  | 'stale';

interface DemoShipment {
  id: string;
  route: string;
  status: 'In transit' | 'Delivered' | 'Pending';
  eta: string;
}

const SUCCESS_ROWS: DemoShipment[] = [
  {
    id: 'SFN-1001',
    route: 'Lagos → London',
    status: 'In transit',
    eta: 'Aug 14',
  },
  {
    id: 'SFN-1002',
    route: 'Accra → Dubai',
    status: 'Pending',
    eta: 'Aug 16',
  },
  {
    id: 'SFN-1003',
    route: 'Nairobi → Amsterdam',
    status: 'Delivered',
    eta: 'Aug 09',
  },
];

/**
 *
 */
@Component({
  selector: 'app-feedback-page',
  standalone: true,
  imports: [
    LoadingStateComponent,
    ErrorStateComponent,
    ErrorIndicatorComponent,
    EmptyStateComponent,
    AsyncStateComponent,
    AiesIconComponent,
    PageHeaderComponent,
    DemoSectionComponent,
  ],
  template: `
    <div class="pg-page-enter flex flex-col gap-10">
      <app-page-header
        eyebrow="Components"
        title="Feedback states"
        description="What to show while a page or section is loading, failed, or empty. Use these for data fetches — not for field validation errors on form controls. Prefer AsyncState when one query owns the whole region."
      />

      <app-demo-section
        title="LoadingState"
        hint="Spinner while data is in flight. Use block to fill a whole region; use inline next to a toolbar label or refresh control."
        [code]="loadingCode"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <div class="flex flex-col gap-2">
            <p class="m-0 text-caption font-medium text-neutral-600 dark:text-neutral-400">
              Block
            </p>
            <div
              class="flex min-h-[10rem] items-center justify-center rounded-lg border border-dashed border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
            >
              <aies-loading-state message="Loading shipments…" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <p class="m-0 text-caption font-medium text-neutral-600 dark:text-neutral-400">
              Inline
            </p>
            <div
              class="flex min-h-[10rem] items-center rounded-lg border border-dashed border-border bg-background-welcome px-5 dark:border-white/10 dark:bg-ink-950"
            >
              <aies-loading-state mode="inline" message="Refreshing rates…" />
            </div>
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="ErrorState"
        hint="Replace the content when the request failed and there is nothing useful to show. Retry is always present — wire (retry) to refetch."
        [code]="errorCode"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="rounded-lg border border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
          >
            <aies-error-state
              message="Failed to load shipments."
              (retry)="onRetry('error-default')"
            />
          </div>
          <div
            class="rounded-lg border border-border bg-background-welcome dark:border-white/10 dark:bg-ink-950"
          >
            <aies-error-state
              message="The rate service timed out after 30s. Check your network and try again."
              (retry)="onRetry('error-long')"
            />
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="ErrorIndicator"
        hint="Keep showing the last good data and put a small retry pill in the corner when a background refresh fails."
        [code]="errorIndicatorCode"
      >
        <div class="flex flex-col gap-6">
          <div
            class="relative min-h-[8rem] overflow-hidden rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink-950"
          >
            <aies-error-indicator
              class="absolute top-3 right-3 z-10 max-w-[min(100%-1.5rem,20rem)]"
              error="Connection lost — showing cached data"
              retryText="Reconnect"
              [refreshing]="reconnecting()"
              refreshingText="Connecting..."
              [disabled]="reconnecting()"
              (retry)="simulateReconnect()"
            />
            <p class="m-0 max-w-[70%] text-body-sm text-neutral-600 dark:text-neutral-400">
              Socket feed panel — list remains interactive while the indicator
              prompts reconnect.
            </p>
          </div>

          <div
            class="relative min-h-[8rem] overflow-hidden rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink-950"
          >
            <aies-error-indicator
              class="absolute top-3 right-3 z-10 max-w-[min(100%-1.5rem,20rem)]"
              error="Error fetching currencies"
              (retry)="onRetry('error-indicator-currencies')"
            />
            <p class="m-0 max-w-[70%] text-body-sm text-neutral-600 dark:text-neutral-400">
              Toolbar rates — default Retry label, no background refresh.
            </p>
          </div>

          <div
            class="relative min-h-[8rem] overflow-hidden rounded-xl border border-border bg-white p-4 dark:border-white/10 dark:bg-ink-950"
          >
            <aies-error-indicator
              class="absolute top-3 right-3 z-10 max-w-[min(100%-1.5rem,20rem)]"
              error="Failed to fetch the most recent data."
              retryText="Refresh"
              [refreshing]="refreshingStale()"
              refreshingText="Refreshing..."
              (retry)="simulateStaleRefresh()"
            />
            <p class="m-0 max-w-[70%] text-body-sm text-neutral-600 dark:text-neutral-400">
              Same pattern AsyncState uses for stale errors.
            </p>
          </div>
        </div>
      </app-demo-section>

      <app-demo-section
        title="EmptyState"
        hint="The request succeeded, but there is nothing to show (no rows, no drafts). Wire Retry to clear filters or start a create flow."
        [code]="emptyCode"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <aies-empty-state
            message="No shipments match your filters."
            (retry)="onRetry('empty')"
          />
          <aies-empty-state
            message="You have not created any drafts yet."
            (retry)="onRetry('empty-drafts')"
          />
        </div>
      </app-demo-section>

      <app-demo-section
        title="AsyncState playground"
        hint="One wrapper around a query result: first load and hard errors block the content; empty shows EmptyState; success renders your template; a background refetch keeps the list visible (use your own control, e.g. table Refresh). Switch scenarios to see each mapping."
        badge="6 scenarios"
        [code]="asyncCode"
      >
        <div
          class="mb-5 inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-background-welcome p-1 dark:bg-ink-950"
          role="tablist"
          aria-label="Async scenario"
        >
          @for (kind of demoKinds; track kind) {
            <button
              type="button"
              role="tab"
              class="rounded-md px-3 py-1.5 text-body-sm transition-colors duration-150"
              [class]="
                demo() === kind
                  ? 'bg-white text-ink shadow-sm dark:bg-ink dark:text-white'
                  : 'text-neutral-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white'
              "
              [attr.aria-selected]="demo() === kind"
              (click)="setDemo(kind)"
            >
              {{ kindLabels[kind] }}
            </button>
          }
        </div>

        <div
          class="relative min-h-[16rem] overflow-hidden rounded-xl border border-border dark:border-white/10"
        >
          <aies-async-state [state]="asyncState()" (retry)="setDemo('content')">
            <div class="bg-white dark:bg-ink-950">
              <div
                class="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5 dark:border-white/10"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-export/10 text-export dark:bg-export/15 dark:text-export-light"
                  >
                    <aies-icon name="airplane" [size]="16" />
                  </span>
                  <div class="min-w-0">
                    <p class="m-0 text-body font-medium text-ink dark:text-white">
                      Shipment list
                    </p>
                    <p class="m-0 text-caption text-neutral-600 dark:text-neutral-400">
                      {{ rowCount() }} active consignments
                    </p>
                  </div>
                </div>
                <span
                  class="shrink-0 rounded-md bg-background-welcome px-2 py-0.5 text-caption tabular-nums text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
                >
                  {{ rowCount() }}
                </span>
              </div>

              <ul class="m-0 list-none divide-y divide-border p-0 dark:divide-white/10">
                @for (row of asyncState().data ?? []; track row.id) {
                  <li
                    class="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-background-welcome/80 dark:hover:bg-white/[0.03]"
                  >
                    <div class="min-w-0 flex-1">
                      <p
                        class="m-0 font-mono text-body-sm font-medium tracking-tight text-ink dark:text-white"
                      >
                        {{ row.id }}
                      </p>
                      <p class="m-0 mt-0.5 text-caption text-neutral-600 dark:text-neutral-400">
                        {{ row.route }}
                      </p>
                    </div>
                    <span
                      class="hidden text-caption text-neutral-500 sm:inline dark:text-neutral-500"
                    >
                      ETA {{ row.eta }}
                    </span>
                    <span
                      class="inline-flex shrink-0 rounded-md px-2 py-0.5 text-caption font-medium"
                      [class]="statusClass(row.status)"
                    >
                      {{ row.status }}
                    </span>
                  </li>
                }
              </ul>
            </div>
          </aies-async-state>
        </div>

        @if (lastRetry()) {
          <p
            class="mt-3 m-0 inline-flex items-center gap-1.5 text-caption text-neutral-600 dark:text-neutral-400"
            role="status"
          >
            <aies-icon name="refresh" [size]="12" />
            Last retry: {{ lastRetry() }}
          </p>
        }
      </app-demo-section>
    </div>
  `,
})
export class FeedbackPage {
  protected readonly demo = signal<DemoKind>('content');
  protected readonly lastRetry = signal<string | null>(null);
  protected readonly reconnecting = signal(false);
  protected readonly refreshingStale = signal(false);
  protected readonly asyncState = signal<AsyncQueryStateModel<DemoShipment[]>>(
    this.buildState('content'),
  );

  protected readonly rowCount = computed(
    () => this.asyncState().data?.length ?? 0,
  );

  protected readonly demoKinds: DemoKind[] = [
    'loading',
    'error',
    'empty',
    'content',
    'fetching',
    'stale',
  ];

  protected readonly kindLabels: Record<DemoKind, string> = {
    loading: 'First load',
    error: 'Blocking error',
    empty: 'Empty',
    content: 'Success',
    fetching: 'Background refresh',
    stale: 'Stale error',
  };

  protected readonly loadingCode = FEEDBACK_LOADING;
  protected readonly errorCode = FEEDBACK_ERROR;
  protected readonly errorIndicatorCode = FEEDBACK_ERROR_INDICATOR;
  protected readonly emptyCode = FEEDBACK_EMPTY;
  protected readonly asyncCode = FEEDBACK_ASYNC;

  protected simulateReconnect(): void {
    this.reconnecting.set(true);
    this.onRetry('error-indicator-reconnect');
    globalThis.setTimeout(() => this.reconnecting.set(false), 1800);
  }

  protected simulateStaleRefresh(): void {
    this.refreshingStale.set(true);
    this.onRetry('error-indicator-stale');
    globalThis.setTimeout(() => this.refreshingStale.set(false), 1800);
  }

  protected setDemo(kind: DemoKind): void {
    this.demo.set(kind);
    this.asyncState.set(this.buildState(kind));
  }

  protected onRetry(source: string): void {
    this.lastRetry.set(source);
  }

  protected statusClass(
    status: DemoShipment['status'],
  ): string {
    switch (status) {
      case 'Delivered':
        return 'bg-export/10 text-export dark:bg-export/15 dark:text-export-light';
      case 'Pending':
        return 'bg-warning-subtle text-warning-dark dark:bg-warning/15 dark:text-warning';
      default:
        return 'bg-import/10 text-import dark:bg-import/15 dark:text-import-light';
    }
  }

  private buildState(kind: DemoKind): AsyncQueryStateModel<DemoShipment[]> {
    switch (kind) {
      case 'loading':
        return {
          data: undefined,
          isLoading: true,
          isFetching: true,
          isError: false,
          error: null,
        };
      case 'error':
        return {
          data: undefined,
          isLoading: false,
          isFetching: false,
          isError: true,
          error: 'Network request failed.',
        };
      case 'empty':
        return {
          data: [],
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
        };
      case 'fetching':
        return {
          data: SUCCESS_ROWS,
          isLoading: false,
          isFetching: true,
          isError: false,
          error: null,
        };
      case 'stale':
        return {
          data: SUCCESS_ROWS.slice(0, 2),
          isLoading: false,
          isFetching: false,
          isError: true,
          error: 'Refresh failed.',
        };
      default:
        return {
          data: SUCCESS_ROWS,
          isLoading: false,
          isFetching: false,
          isError: false,
          error: null,
        };
    }
  }
}
