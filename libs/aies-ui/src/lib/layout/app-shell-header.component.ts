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
import type { HeaderWeather } from './header-greeting.util';
import { pickHeaderGreeting } from './header-greeting.util';
import {
  headerWeatherIcon,
  headerWeatherLabel,
  loadHeaderWeather,
} from './header-weather';

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
 * Product header bar for {@link AppShellComponent}: a short time-of-day kicker
 * plus the given name, local weather, live clock, notification inbox drawer,
 * and avatar menu.
 * Breadcrumbs and Back belong in the content column via
 * {@link AppShellContentHeaderComponent}.
 *
 * @example
 * ```html
 * <aies-app-shell-header
 *   greetingName="Jane"
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
      class="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <ng-content select="[aiesAppShellHeaderStart]" />

        @if (greeting(); as hello) {
          <div class="min-w-0 overflow-hidden">
            <p
              class="m-0 truncate text-caption leading-none text-neutral-500 dark:text-neutral-400"
            >
              {{ hello.kicker }}
            </p>
            <p
              class="m-0 mt-1 truncate text-body font-semibold leading-none tracking-tight text-ink sm:text-body-lg dark:text-white"
            >
              {{ hello.name }}
            </p>
          </div>
        }
      </div>

      <div class="flex shrink-0 items-center gap-1.5 sm:gap-3">
        @if (weather() || showClock()) {
          <div
            class="hidden items-center gap-3 pr-2 sm:flex sm:border-r sm:border-border sm:pr-4 dark:sm:border-white/15"
          >
            @if (weather()) {
              <div
                class="flex items-center gap-1.5"
                [attr.aria-label]="weatherAriaLabel()"
              >
                <aies-icon
                  [name]="weatherIcon()"
                  [size]="18"
                  class="text-neutral-500 dark:text-neutral-400"
                />
                @if (weatherTemp(); as temp) {
                  <span
                    class="text-body-sm font-medium tabular-nums tracking-tight text-ink dark:text-white"
                  >
                    {{ temp }}°
                  </span>
                }
                <span
                  class="hidden text-caption text-neutral-500 md:inline dark:text-neutral-400"
                >
                  {{ weatherPlace() }}
                </span>
              </div>
            }

            @if (showClock()) {
              <div class="flex items-baseline gap-2" aria-live="polite">
                <time
                  class="hidden text-caption text-neutral-500 md:inline dark:text-neutral-400"
                  [dateTime]="nowIso()"
                >
                  {{ now() | date: clockDateFormat() }}
                </time>
                <time
                  class="text-body-sm font-medium tabular-nums tracking-tight text-ink dark:text-white"
                  [dateTime]="nowIso()"
                >
                  {{ now() | date: clockFormat() }}
                </time>
              </div>
            }
          </div>
        }

        <ng-content select="[aiesAppShellHeaderEnd]" />

        @if (showNotifications() || userName()) {
          <div
            class="flex items-center gap-1.5 sm:gap-3"
            [class.border-l]="!(weather() || showClock())"
            [class.border-border]="!(weather() || showClock())"
            [class.pl-2]="!(weather() || showClock())"
            [class.sm:pl-3]="!(weather() || showClock())"
            [class.dark:border-white/15]="!(weather() || showClock())"
          >
            @if (showNotifications()) {
              <button
                type="button"
                class="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-background-welcome hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
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

            @if (userName()) {
              <aies-avatar-menu
                [name]="userName()!"
                [src]="userAvatarSrc()"
                [menuItems]="userMenuItems()"
                [size]="'md'"
              />
            }
          </div>
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

  /**
   * Given or full name used to pick a time-of-day greeting.
   */
  readonly greetingName = input<string | null>(null);

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
   * Layout density — reserved for compact header previews.
   * Defaults to `desktop`.
   */
  readonly density = input<AppShellHeaderDensity>('desktop');

  /** Angular DatePipe format for the clock date line. */
  readonly clockDateFormat = input('EEE, MMM d, y');

  /** Angular DatePipe format for the clock time (minutes, no seconds). */
  readonly clockFormat = input('h:mm a');

  protected readonly now = signal(new Date());

  protected readonly weather = signal<HeaderWeather | null>(null);

  protected readonly nowIso = computed(() => this.now().toISOString());

  protected readonly greeting = computed(() =>
    pickHeaderGreeting(this.greetingName(), this.now(), this.weather()),
  );

  protected readonly weatherIcon = computed(() => {
    const forecast = this.weather();
    if (!forecast) {
      return 'cloud-o';
    }
    return headerWeatherIcon(forecast.kind, this.now().getHours());
  });

  protected readonly weatherTemp = computed(() => {
    const temp = this.weather()?.temperatureC;
    if (temp === undefined || !Number.isFinite(temp)) {
      return null;
    }
    return temp.toFixed(1);
  });

  protected readonly weatherPlace = computed(() => {
    const forecast = this.weather();
    if (!forecast) {
      return '';
    }
    return forecast.city?.trim() || headerWeatherLabel(forecast.kind);
  });

  protected readonly weatherAriaLabel = computed(() => {
    const forecast = this.weather();
    if (!forecast) {
      return 'Weather';
    }
    const condition = headerWeatherLabel(forecast.kind).toLowerCase();
    const temp = this.weatherTemp();
    const city = forecast.city?.trim();
    const degrees = temp === null ? condition : `${temp} degrees, ${condition}`;
    return city ? `Weather in ${city}: ${degrees}` : `Weather: ${degrees}`;
  });

  protected readonly unreadCount = computed(
    () => (this.notifications() ?? []).filter((n) => !n.read).length,
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
    let active = true;
    const refreshWeather = (): void => {
      void loadHeaderWeather().then((forecast) => {
        if (active && forecast) {
          this.weather.set(forecast);
        }
      });
    };

    refreshWeather();
    const tick = setInterval(() => {
      const next = new Date();
      const hourChanged =
        next.getHours() !== this.now().getHours() ||
        next.getDate() !== this.now().getDate();
      this.now.set(next);
      if (hourChanged) {
        refreshWeather();
      }
    }, 1_000);
    this.destroyRef.onDestroy(() => {
      active = false;
      clearInterval(tick);
    });
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
