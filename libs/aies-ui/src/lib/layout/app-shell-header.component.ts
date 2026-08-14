import { DatePipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import type { Observable } from 'rxjs';

import { AiesIconComponent } from '@aies/aies-icons';

import type { AiesMenuItem } from '../action-menu/menu-item';
import { AvatarMenuComponent } from '../avatar';
import type { AiesNotification, NotificationPageResult } from '../notifications';
import { NotificationDrawerService } from '../notifications';

/** Header density — affects clock visibility in narrow layouts. */
export type AppShellHeaderDensity = 'mobile' | 'tablet' | 'desktop';

/**
 * Marks projected content as extra leading chrome in {@link AppShellHeaderComponent}.
 */
@Directive({
  selector: '[aiesAppShellHeaderStart]',
  standalone: true,
})
export class AppShellHeaderStartDirective {}

/**
 * Marks projected content as extra trailing chrome in {@link AppShellHeaderComponent}.
 */
@Directive({
  selector: '[aiesAppShellHeaderEnd]',
  standalone: true,
})
export class AppShellHeaderEndDirective {}

/**
 * Product header bar for {@link AppShellComponent}: live clock, notification
 * inbox drawer, and avatar account menu. Breadcrumbs and Back belong in the
 * content column via {@link AppShellContentHeaderComponent}.
 *
 * @example
 * ```html
 * <aies-app-shell-header
 *   userName="Jane Doe"
 *   [userMenuItems]="accountMenu"
 *   [notifications]="notifications"
 * />
 * ```
 */
@Component({
  selector: 'aies-app-shell-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, AvatarMenuComponent, DatePipe],
  template: `
    <div
      class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
    >
      <div class="flex min-w-0 flex-1 items-center">
        <ng-content select="[aiesAppShellHeaderStart]" />
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        @if (showClock()) {
          <div
            [class]="clockClass()"
            aria-live="polite"
          >
            <time
              [dateTime]="nowIso()"
              class="text-neutral-600 dark:text-neutral-400"
            >
              {{ now() | date: clockDateFormat() }}
            </time>
            <time
              [dateTime]="nowIso()"
              class="font-medium text-ink dark:text-white"
            >
              {{ now() | date: clockFormat() }}
            </time>
          </div>
        }

        @if (showNotifications()) {
          <button
            type="button"
            class="relative inline-flex size-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
            [attr.aria-label]="notificationAriaLabel()"
            (click)="openNotifications()"
          >
            <aies-icon
              name="bell-o"
              [size]="24"
              class="block translate-x-[-1px] translate-y-0.5"
            />
            @if (unreadCount() > 0) {
              <span
                class="pointer-events-none absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-ink-950"
                aria-hidden="true"
              >
                {{ unreadBadge() }}
              </span>
            }
          </button>
        }

        <ng-content select="[aiesAppShellHeaderEnd]" />

        @if (userName()) {
          <aies-avatar-menu
            [name]="userName()!"
            [src]="userAvatarSrc()"
            [menuItems]="userMenuItems()"
            [size]="'md'"
          />
        }
      </div>
    </div>
  `,
})
export class AppShellHeaderComponent {
  private readonly notificationsDrawer = inject(NotificationDrawerService);
  private readonly destroyRef = inject(DestroyRef);

  /** Account display name for the avatar menu. */
  readonly userName = input<string | null>(null);

  /** Optional avatar image URL. */
  readonly userAvatarSrc = input<string | null>(null);

  /** Menu entries for the avatar overflow menu. */
  readonly userMenuItems = input<AiesMenuItem[]>([]);

  /** Notifications listed in the drawer. */
  readonly notifications = input<AiesNotification[]>([]);

  /** Drawer heading override. */
  readonly notificationsTitle = input('Notifications');

  /** Marks one notification read when the user taps View. */
  readonly onNotificationMarkRead = input<
    ((id: string) => Observable<unknown> | Promise<unknown> | void) | undefined
  >(undefined);

  /** Marks every notification read from the drawer header. */
  readonly onNotificationMarkAllRead = input<
    (() => Observable<unknown> | Promise<unknown> | void) | undefined
  >(undefined);

  /** Paginated inbox fetch for infinite scroll inside the drawer. */
  readonly onNotificationLoadPage = input<
    | ((
        page: number,
      ) => Observable<NotificationPageResult> | Promise<NotificationPageResult>)
    | undefined
  >(undefined);

  /** When false, hides the live clock. */
  readonly showClock = input(true, { transform: booleanAttribute });

  /** When false, hides the bell control. */
  readonly showNotifications = input(true, { transform: booleanAttribute });

  /**
   * Layout density — `mobile` hides the clock; `tablet` always shows it.
   * Defaults to `desktop` (clock from `sm` breakpoint up).
   */
  readonly density = input<AppShellHeaderDensity>('desktop');

  /** Angular DatePipe format for the clock date line. */
  readonly clockDateFormat = input('EEE, MMM d, y');

  /** Angular DatePipe format for the clock time line (include seconds by default). */
  readonly clockFormat = input('h:mm:ss a');

  protected readonly now = signal(new Date());

  protected readonly nowIso = computed(() => this.now().toISOString());

  protected readonly clockClass = computed(() => {
    const base =
      'flex-col items-end gap-0.5 text-caption leading-tight tabular-nums';
    switch (this.density()) {
      case 'mobile':
        return `hidden ${base}`;
      case 'tablet':
        return `flex ${base}`;
      default:
        return `hidden sm:flex ${base}`;
    }
  });

  protected readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.read).length,
  );

  protected readonly unreadBadge = computed(() => {
    const count = this.unreadCount();
    return count > 9 ? '9+' : `${count}`;
  });

  protected readonly notificationAriaLabel = computed(() => {
    const unread = this.unreadCount();
    if (unread === 0) {
      return 'Open notifications';
    }
    return `Open notifications, ${unread} unread`;
  });

  constructor() {
    const tick = setInterval(() => this.now.set(new Date()), 1_000);
    this.destroyRef.onDestroy(() => clearInterval(tick));
  }

  protected openNotifications(): void {
    const onMarkRead = this.onNotificationMarkRead();
    const onMarkAllRead = this.onNotificationMarkAllRead();
    const onLoadPage = this.onNotificationLoadPage();

    this.notificationsDrawer
      .open({
        title: this.notificationsTitle(),
        notifications: onLoadPage ? undefined : this.notifications(),
        onLoadPage,
        onMarkRead,
        onMarkAllRead,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
