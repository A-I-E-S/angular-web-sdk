import { DatePipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  runInInjectionContext,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { isObservable, type Observable, take } from 'rxjs';

import { resolveNotificationLinkForMode, ShippingModeService } from '@aies/aies-core';
import { AiesIconComponent } from '@aies/aies-icons';
import type { PaginationMetaModel } from '@aies/aies-models';

import { ButtonComponent } from '../button/button.component';
import { AiesOverlayRef } from '../overlay/aies-overlay-ref';
import { OVERLAY_DATA } from '../overlay/overlay-data.token';
import type {
  AiesNotification,
  NotificationDrawerData,
  NotificationDrawerResult,
  NotificationPageResult,
} from './notification.types';

/** Pixels before the list end to prefetch the next page. */
const SCROLL_PREFETCH_PX = 120;

/**
 * Right-edge drawer listing in-app notifications.
 *
 * Opened via {@link NotificationDrawerService}.
 */
@Component({
  selector: 'aies-notification-drawer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full w-full min-w-0',
  },
  imports: [AiesIconComponent, ButtonComponent],
  template: `
    <div class="flex h-full min-h-0 w-full flex-col">
      <div
        class="flex shrink-0 items-start justify-between gap-3 border-b border-border pb-4 dark:border-white/10"
      >
        <div class="min-w-0 flex flex-col gap-1">
          <p
            class="m-0 text-caption font-medium uppercase tracking-wide text-neutral-600 dark:text-neutral-400"
          >
            Inbox
          </p>
          <h2 class="m-0 text-heading-3 font-bold text-ink dark:text-white">
            {{ title() }}
          </h2>
          @if (hasUnread()) {
            <p class="m-0 text-caption text-neutral-500 dark:text-neutral-400">
              {{ unreadCount() }} unread
            </p>
          }
        </div>
        <div class="flex shrink-0 items-center gap-1">
          @if (hasUnread() && canMarkAllRead()) {
            <button
              aies-button
              type="button"
              variant="ghost"
              size="sm"
              [disabled]="markingAll()"
              (click)="markAllRead()"
            >
              {{ markingAll() ? 'Marking…' : 'Mark all read' }}
            </button>
          }
          <button
            aies-button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close notifications"
            (click)="ref.close()"
          >
            <aies-icon name="close" [size]="18" />
          </button>
        </div>
      </div>

      <div
        #scrollHost
        class="flex min-h-0 flex-1 w-full flex-col overflow-y-auto py-3"
      >
        @if (loadingInitial()) {
          <div
            class="flex flex-1 flex-col items-center justify-center gap-2 py-12"
            aria-busy="true"
            aria-live="polite"
          >
            <aies-icon
              name="spinner"
              [size]="24"
              class="animate-spin text-neutral-500 dark:text-neutral-400"
            />
            <p class="m-0 text-body-sm text-neutral-600 dark:text-neutral-400">
              Loading notifications…
            </p>
          </div>
        } @else if (loadError()) {
          <div class="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p class="m-0 text-body-sm text-neutral-700 dark:text-neutral-300">
              {{ loadError() }}
            </p>
            @if (usesPagination()) {
              <button
                aies-button
                type="button"
                variant="secondary"
                size="sm"
                (click)="retryInitialLoad()"
              >
                Try again
              </button>
            }
          </div>
        } @else if (items().length === 0) {
          <div
            class="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center"
          >
            <aies-icon
              name="bell-o"
              [size]="32"
              class="text-neutral-400 dark:text-neutral-500"
            />
            <p class="m-0 max-w-xs text-body leading-relaxed text-neutral-600 dark:text-neutral-300">
              You're all caught up.
            </p>
          </div>
        } @else {
          <ul class="m-0 flex w-full list-none flex-col gap-3 p-0">
            @for (item of items(); track item.id) {
              <li>
                <article
                  class="flex w-full gap-2.5 rounded-xl border px-3 py-2.5 transition-colors"
                  [class]="itemCardClass(item)"
                >
                  <span
                    class="mt-1.5 size-1.5 shrink-0 rounded-full"
                    [class.bg-ink-blue]="!item.read"
                    [class.dark:bg-export-light]="!item.read"
                    [class.bg-transparent]="item.read"
                    aria-hidden="true"
                  ></span>

                  <div class="min-w-0 flex-1 flex flex-col gap-1.5">
                    <div class="flex items-start justify-between gap-2">
                      <h3
                        class="m-0 min-w-0 flex-1 text-body-sm leading-snug"
                        [class.font-bold]="!item.read"
                        [class.text-ink]="!item.read"
                        [class.dark:text-white]="!item.read"
                        [class.font-medium]="item.read"
                        [class.text-neutral-600]="item.read"
                        [class.dark:text-neutral-300]="item.read"
                      >
                        {{ item.title }}
                      </h3>
                      @if (item.timestamp) {
                        <time
                          class="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400"
                          [dateTime]="item.timestamp"
                        >
                          {{ formatTimestamp(item.timestamp) }}
                        </time>
                      }
                    </div>

                    @if (item.body) {
                      <p
                        class="m-0 text-caption leading-relaxed"
                        [class.text-neutral-800]="!item.read"
                        [class.dark:text-neutral-100]="!item.read"
                        [class.text-neutral-600]="item.read"
                        [class.dark:text-neutral-400]="item.read"
                      >
                        {{ item.body }}
                      </p>
                    }

                    @if (!item.read && canMarkRead()) {
                      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                        @if (item.link) {
                          <a
                            [href]="viewHref(item)"
                            [class]="viewLinkClass()"
                            [class.pointer-events-none]="markingId() === item.id"
                            [class.opacity-50]="markingId() === item.id"
                            [attr.target]="item.externalLink ? '_blank' : null"
                            [attr.rel]="item.externalLink ? 'noopener noreferrer' : null"
                            (click)="onViewClick($event, item)"
                          >
                            {{ markingId() === item.id ? 'Opening…' : 'View' }}
                            @if (item.externalLink) {
                              <aies-icon name="external-link" [size]="12" />
                            }
                          </a>
                        }
                        <button
                          type="button"
                          class="inline-flex self-start rounded-md text-caption font-medium text-neutral-600 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white"
                          [disabled]="markingId() === item.id"
                          (click)="markRead(item)"
                        >
                          {{ markingId() === item.id ? 'Marking…' : 'Mark read' }}
                        </button>
                      </div>
                    } @else if (item.link) {
                      <a
                        [href]="viewHref(item)"
                        [class]="viewLinkClass()"
                        [class.pointer-events-none]="markingId() === item.id"
                        [class.opacity-50]="markingId() === item.id"
                        [attr.target]="item.externalLink ? '_blank' : null"
                        [attr.rel]="item.externalLink ? 'noopener noreferrer' : null"
                        (click)="onViewClick($event, item)"
                      >
                        {{ markingId() === item.id ? 'Opening…' : 'View' }}
                        @if (item.externalLink) {
                          <aies-icon name="external-link" [size]="12" />
                        }
                      </a>
                    }
                  </div>
                </article>
              </li>
            }
          </ul>

          @if (usesPagination()) {
            <div
              #loadSentinel
              class="flex min-h-10 items-center justify-center py-2"
              aria-hidden="true"
            >
              @if (loadingMore()) {
                <span
                  class="inline-flex items-center gap-2 text-caption text-neutral-500 dark:text-neutral-400"
                  aria-live="polite"
                >
                  <aies-icon name="spinner" [size]="14" class="animate-spin" />
                  Loading more…
                </span>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class NotificationDrawerPanel {
  protected readonly ref =
    inject<AiesOverlayRef<NotificationDrawerResult>>(AiesOverlayRef);
  private readonly data = inject<NotificationDrawerData>(OVERLAY_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly shipping = inject(ShippingModeService);

  private readonly scrollHost = viewChild<ElementRef<HTMLElement>>('scrollHost');
  private readonly loadSentinel =
    viewChild<ElementRef<HTMLElement>>('loadSentinel');

  private observer: IntersectionObserver | null = null;

  protected readonly viewLinkClass = computed(() => {
    const base =
      'inline-flex items-center gap-1 self-start text-caption font-semibold underline underline-offset-[3px] transition-colors';
    if (this.shipping.mode() === 'stn') {
      return `${base} text-import decoration-import/35 hover:decoration-import dark:text-import-light dark:decoration-import-light/40 dark:hover:decoration-import-light`;
    }
    return `${base} text-export decoration-export/35 hover:decoration-export dark:text-export-light dark:decoration-export-light/40 dark:hover:decoration-export-light`;
  });

  protected readonly title = computed(() => this.data.title ?? 'Notifications');
  protected readonly items = signal<AiesNotification[]>(
    this.data.onLoadPage ? [] : (this.data.notifications ?? []),
  );
  protected readonly markingId = signal<string | null>(null);
  protected readonly markingAll = signal(false);
  protected readonly loadingInitial = signal(!!this.data.onLoadPage);
  protected readonly loadingMore = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly hasMore = signal(false);
  protected readonly currentPage = signal(0);

  protected readonly unreadCount = computed(
    () => this.items().filter((item) => !item.read).length,
  );
  protected readonly hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    if (this.data.onLoadPage) {
      this.fetchPage(1, 'replace');
    }

    effect(() => {
      if (
        this.loadingInitial() ||
        !this.data.onLoadPage ||
        !this.hasMore() ||
        this.items().length === 0 ||
        !this.loadSentinel()
      ) {
        return;
      }

      untracked(() => this.scheduleInfiniteScrollSetup());
    });

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.observer = null;
    });
  }

  protected usesPagination(): boolean {
    return typeof this.data.onLoadPage === 'function';
  }

  protected canMarkAllRead(): boolean {
    return typeof this.data.onMarkAllRead === 'function';
  }

  protected canMarkRead(): boolean {
    return typeof this.data.onMarkRead === 'function';
  }

  protected retryInitialLoad(): void {
    if (!this.data.onLoadPage) {
      return;
    }
    this.loadError.set(null);
    this.fetchPage(1, 'replace');
  }

  protected itemCardClass(item: AiesNotification): string {
    if (item.read) {
      return 'border-border bg-transparent dark:border-white/10';
    }
    return 'border-ink-blue/20 bg-background-welcome dark:border-export-light/20 dark:bg-white/[0.04]';
  }

  protected viewHref(item: AiesNotification): string {
    const link = item.link?.trim();
    if (!link) {
      return '';
    }
    return resolveNotificationLinkForMode(link, this.shipping.mode());
  }

  protected onViewClick(event: MouseEvent, item: AiesNotification): void {
    if (this.markingId() || this.markingAll()) {
      event.preventDefault();
      return;
    }

    const closeDrawer = (): void => {
      this.ref.close({
        selectedId: item.id,
        markedReadId: item.read ? undefined : item.id,
      });
    };

    const navigate = (): void => {
      const link = this.viewHref(item);
      if (link) {
        if (item.externalLink) {
          window.open(link, '_blank', 'noopener,noreferrer');
        } else {
          window.location.assign(link);
        }
      }
      closeDrawer();
    };

    if (item.read || !this.data.onMarkRead) {
      closeDrawer();
      return;
    }

    event.preventDefault();
    this.markingId.set(item.id);
    this.runHook(
      () => this.data.onMarkRead?.(item.id),
      () => {
        this.patchRead(item.id);
        this.markingId.set(null);
        navigate();
      },
      () => this.markingId.set(null),
    );
  }

  protected markRead(item: AiesNotification): void {
    if (item.read || this.markingId() || this.markingAll() || !this.data.onMarkRead) {
      return;
    }

    this.markingId.set(item.id);
    this.runHook(
      () => this.data.onMarkRead?.(item.id),
      () => {
        this.patchRead(item.id);
        this.markingId.set(null);
      },
      () => this.markingId.set(null),
    );
  }

  protected markAllRead(): void {
    if (this.markingAll() || !this.data.onMarkAllRead) {
      return;
    }

    this.markingAll.set(true);
    this.runHook(
      () => this.data.onMarkAllRead?.(),
      () => {
        this.items.update((rows) => rows.map((row) => ({ ...row, read: true })));
        this.markingAll.set(false);
        this.ref.close({ markedAllRead: true });
      },
      () => this.markingAll.set(false),
    );
  }

  protected formatTimestamp(value: string): string {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
      return value;
    }
    return new DatePipe('en-US').transform(parsed, 'MMM d, h:mm a') ?? value;
  }

  private scheduleInfiniteScrollSetup(): void {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.setupInfiniteScroll());
    });
  }

  private setupInfiniteScroll(): void {
    this.observer?.disconnect();

    const root = this.scrollHost()?.nativeElement;
    const sentinel = this.loadSentinel()?.nativeElement;
    if (!root || !sentinel || !this.data.onLoadPage) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        this.loadNextPage();
      },
      {
        root,
        rootMargin: `0px 0px ${SCROLL_PREFETCH_PX}px 0px`,
        threshold: 0,
      },
    );

    this.observer.observe(sentinel);
  }

  private resolveHasMore(
    pagination: PaginationMetaModel | null,
    itemCount: number,
  ): boolean {
    if (itemCount === 0) {
      return false;
    }

    if (pagination == null) {
      return false;
    }

    if (pagination.has_next_page) {
      return true;
    }

    if (pagination.total_pages > 0) {
      return pagination.current_page < pagination.total_pages;
    }

    return false;
  }

  private loadNextPage(): void {
    if (
      !this.data.onLoadPage ||
      !this.hasMore() ||
      this.loadingMore() ||
      this.loadingInitial()
    ) {
      return;
    }

    this.fetchPage(this.currentPage() + 1, 'append');
  }

  private fetchPage(page: number, mode: 'replace' | 'append'): void {
    const loadPage = this.data.onLoadPage;
    if (!loadPage) {
      return;
    }

    if (mode === 'replace') {
      this.loadingInitial.set(true);
      this.loadError.set(null);
    } else {
      this.loadingMore.set(true);
    }

    this.runPageLoad(
      () => loadPage(page),
      (result) => {
        if (mode === 'replace') {
          this.items.set(result.items);
        } else {
          this.appendItems(result.items);
        }

        this.currentPage.set(page);
        this.hasMore.set(this.resolveHasMore(result.pagination, result.items.length));
        this.loadingInitial.set(false);
        this.loadingMore.set(false);
      },
      () => {
        if (mode === 'replace') {
          this.loadError.set('Could not load notifications. Try again.');
          this.loadingInitial.set(false);
        }
        this.loadingMore.set(false);
      },
    );
  }

  private appendItems(incoming: AiesNotification[]): void {
    if (!incoming.length) {
      return;
    }

    this.items.update((existing) => {
      const seen = new Set(existing.map((item) => item.id));
      const next = incoming.filter((item) => !seen.has(item.id));
      return next.length ? [...existing, ...next] : existing;
    });
  }

  private patchRead(id: string): void {
    this.items.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, read: true } : row)),
    );
  }

  private runPageLoad(
    invoke: () => Observable<NotificationPageResult> | Promise<NotificationPageResult>,
    succeed: (result: NotificationPageResult) => void,
    fail: () => void,
  ): void {
    let pending: Observable<NotificationPageResult> | Promise<NotificationPageResult>;
    try {
      pending = invoke();
    } catch {
      fail();
      return;
    }

    if (isObservable(pending)) {
      pending.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => succeed(result),
        error: () => fail(),
      });
      return;
    }

    void Promise.resolve(pending).then(succeed, fail);
  }

  private runHook(
    invoke: () => Observable<unknown> | Promise<unknown> | void | undefined,
    succeed: () => void,
    fail: () => void,
  ): void {
    let pending: Observable<unknown> | Promise<unknown> | void;
    try {
      pending = invoke();
    } catch {
      fail();
      return;
    }

    if (pending == null) {
      succeed();
      return;
    }

    if (isObservable(pending)) {
      pending.pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => succeed(),
        error: () => fail(),
      });
      return;
    }

    void Promise.resolve(pending).then(succeed, fail);
  }
}
