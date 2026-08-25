import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  type IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';

import { catchError, filter, finalize, map, of, switchMap, tap } from 'rxjs';

import {
  AuthTokenService,
  mapNotificationInboxItem,
  NotificationService,
  ShippingModeService,
  UserService,
} from '@africanies/africanies-core';
import { AfricaniesIconComponent } from '@africanies/africanies-icons';
import {
  NOTIFICATION_PAGE_SIZE,
  type NotificationModel,
  type ShippingMode,
  type UserModel,
} from '@africanies/africanies-models';
import { ThemeService } from '@africanies/africanies-theme';
import {
  type AfricaniesMenuItem,
  type AfricaniesNotification,
  type AfricaniesSideNavItem,
  AppShellComponent,
  AppShellHeaderComponent,
  AppShellHeaderEndDirective,
  AppShellHeaderSlotDirective,
  buildBreadcrumbsFromSideNav,
  ButtonComponent,
  ConfirmService,
  type NotificationPageResult,
  SideNavComponent,
  ToastService,
} from '@africanies/africanies-ui';

import { PlaygroundAccessTokenComponent } from './shared/playground-access-token.component';

/**
 * Playground root — product {@link AppShellComponent} + catalog side nav.
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppShellComponent,
    AppShellHeaderComponent,
    AppShellHeaderSlotDirective,
    AppShellHeaderEndDirective,
    SideNavComponent,
    ButtonComponent,
    AfricaniesIconComponent,
    PlaygroundAccessTokenComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly shipping = inject(ShippingModeService);
  private readonly auth = inject(AuthTokenService);
  private readonly notificationsApi = inject(NotificationService);
  private readonly usersApi = inject(UserService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly themeMode = this.theme.theme;
  protected readonly shippingMode = this.shipping.mode;
  protected readonly navCollapsed = signal(false);
  protected readonly notifications = signal<AfricaniesNotification[]>([]);
  protected readonly profile = signal<UserModel | null>(null);

  protected readonly greetingName = computed(
    () => this.profile()?.first_name || this.profile()?.name || null,
  );

  protected readonly displayName = computed(
    () => this.profile()?.name || this.greetingName() || 'Playground',
  );

  constructor() {
    toObservable(this.auth.token)
      .pipe(
        switchMap((token) => {
          if (!token) {
            return of([] as AfricaniesNotification[]);
          }
          return this.notificationsApi
            .readPage({
              page: 1,
              size: NOTIFICATION_PAGE_SIZE,
              order: 'desc',
            })
            .pipe(
            map((res) =>
              res.success && res.data
                ? this.mapNotificationRows(res.data)
                : [],
            ),
            catchError(() => of([] as AfricaniesNotification[])),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((items) => this.notifications.set(items));

    toObservable(this.auth.token)
      .pipe(
        switchMap((token) => {
          if (!token) {
            return of(null as UserModel | null);
          }
          return this.usersApi.me().pipe(
            map((res) => (res.success && res.data ? res.data : null)),
            catchError(() => of(null as UserModel | null)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((user) => this.profile.set(user));
  }

  protected loadNotificationPage = (page: number) =>
    this.notificationsApi
      .readPage({ page, size: NOTIFICATION_PAGE_SIZE, order: 'desc' })
      .pipe(
        map(
          (res): NotificationPageResult => ({
            items:
              res.success && res.data ? this.mapNotificationRows(res.data) : [],
            pagination: res.pagination ?? null,
          }),
        ),
      );

  protected markNotificationRead = (id: string) =>
    this.notificationsApi.markRead(id).pipe(
      tap(() => {
        this.notifications.update((items) =>
          items.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        );
      }),
    );

  protected markAllNotificationsRead = () =>
    this.notificationsApi.markRead().pipe(
      tap(() => {
        this.notifications.update((items) =>
          items.map((item) => ({ ...item, read: true })),
        );
      }),
    );

  private mapNotificationRows(rows: NotificationModel[]): AfricaniesNotification[] {
    return rows.map((row) => {
      const item = mapNotificationInboxItem(row);
      return {
        id: item.id,
        title: item.title,
        body: item.body,
        timestamp: item.timestamp,
        read: item.read,
        link: item.link,
        externalLink: item.external_link,
        image: item.image,
      } satisfies AfricaniesNotification;
    });
  }

  /**
   * Exact path match keeps `/` from lighting up every route (SideNav default
   * is subset). Navigation uses its overview path; child nav demos stay nested
   * under that page’s own chrome.
   */
  protected readonly linkActiveOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly crumbs = computed(() =>
    buildBreadcrumbsFromSideNav(this.url(), this.navItems),
  );

  protected readonly pageTitle = computed(() => {
    const trail = this.crumbs();
    return trail[trail.length - 1]?.label ?? 'Playground';
  });

  protected readonly accountMenu: AfricaniesMenuItem[] = [
    {
      label: 'Profile',
      icon: 'user',
      onClick: () => undefined,
    },
    {
      label: 'Settings',
      icon: 'cog',
      onClick: () => undefined,
    },
    {
      label: 'Log out',
      icon: 'sign-out',
      danger: true,
      dividerBefore: true,
      onClick: () => this.confirmLogout(),
    },
  ];

  protected readonly navItems: AfricaniesSideNavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'home', routerLink: '/overview' },
    {
      id: 'components',
      label: 'Components',
      icon: 'grid',
      children: [
        { id: 'button', label: 'Button', routerLink: '/components/button' },
        { id: 'alert', label: 'Alert', routerLink: '/components/alert' },
        { id: 'chip', label: 'Chip', routerLink: '/components/chip' },
        {
          id: 'action-menu',
          label: 'Action menu',
          routerLink: '/components/action-menu',
        },
        {
          id: 'feedback',
          label: 'Feedback',
          routerLink: '/components/feedback',
        },
        {
          id: 'overlays',
          label: 'Overlays',
          routerLink: '/components/overlays',
        },
        { id: 'forms', label: 'Forms', routerLink: '/components/forms' },
        { id: 'filters', label: 'Filters', routerLink: '/components/filters' },
        { id: 'tooltip', label: 'Tooltip', routerLink: '/components/tooltip' },
        { id: 'toast', label: 'Toast', routerLink: '/components/toast' },
        {
          id: 'navigation',
          label: 'Navigation',
          routerLink: '/components/navigation/overview',
        },
        { id: 'table', label: 'Table', routerLink: '/components/table' },
        { id: 'stepper', label: 'Stepper', routerLink: '/components/stepper' },
      ],
    },
    {
      id: 'usecases',
      label: 'Use cases',
      icon: 'truck',
      children: [
        {
          id: 'back-breadcrumbs',
          label: 'Back button and Breadcrumbs',
          routerLink: '/usecases/shipment',
        },
        {
          id: 'onboarding-forgot',
          label: 'Forgot password',
          routerLink: '/usecases/onboarding/login',
        },
      ],
    },
    {
      id: 'foundation',
      label: 'Foundation',
      icon: 'cube',
      children: [
        { id: 'icons', label: 'Icons', routerLink: '/icons' },
        { id: 'tokens', label: 'Tokens', routerLink: '/tokens' },
        { id: 'models', label: 'Models', routerLink: '/models' },
        { id: 'api', label: 'SDK API', routerLink: '/api' },
      ],
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: 'book',
      children: [{ id: 'lecture', label: 'Lecture', routerLink: '/lecture' }],
    },
  ];

  protected toggleTheme(): void {
    this.theme.toggle();
  }

  protected setShippingMode(mode: ShippingMode): void {
    this.shipping.setMode(mode);
  }

  private confirmLogout(): void {
    this.confirm
      .confirm({
        title: 'Log out?',
        message:
          'This signs you out of this device and every other session.',
        confirmLabel: 'Log out',
        danger: true,
      })
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        const finishLocalLogout = (): void => {
          this.auth.clear();
        };
        if (!this.auth.get()) {
          finishLocalLogout();
          this.toast.success('You have been logged out.');
          return;
        }
        this.usersApi
          .logoutFromAllSessions()
          .pipe(finalize(finishLocalLogout))
          .subscribe({
            next: (res) => {
              this.toast.success(
                res.message?.trim() || 'You have been logged out.',
              );
            },
            error: () => {
              this.toast.success('You have been logged out.');
            },
          });
      });
  }
}
