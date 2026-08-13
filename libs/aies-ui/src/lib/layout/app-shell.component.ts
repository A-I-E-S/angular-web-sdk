import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';

import { AiesIconComponent } from '@aies/aies-icons';
import { ModeColorService } from '@aies/aies-theme';

import type { AiesMenuItem } from '../action-menu/menu-item';
import { AIES_BRAND_LOGO_MINI_URL } from '../brand';
import type { AiesNavItem } from '../navigation/nav-item';
import type { AiesNotification } from '../notifications';
import { AppShellHeaderComponent } from './app-shell-header.component';
import { AppShellHeaderSlotDirective } from './app-shell-header-slot.directive';

/**
 * Content column max-width for {@link AppShellComponent}.
 *
 * Matches common product reading widths; `full` drops the centered constraint.
 */
export type AppShellContentWidth = '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';

/**
 * Forces a layout breakpoint for embeds and playground previews (ignores viewport).
 * Omit in production apps to follow Tailwind `lg` (1024px).
 */
export type AppShellLayoutPreview = 'mobile' | 'tablet' | 'desktop';

/**
 * Application chrome scaffold: side nav + sticky header + constrained content.
 *
 * Projection slots:
 * - `[sidenav]` — typically `<aies-side-nav>` (sticky full-height rail)
 * - `[aiesAppShellHeader]` — optional custom top bar (replaces built-in chrome header)
 * - default — page body inside a centered max-width column (playground-style)
 *
 * When no `[aiesAppShellHeader]` is projected, a dedicated product header renders with
 * breadcrumbs, title, live clock, notification drawer, and avatar menu.
 *
 * Below `lg`, the rail hides and a host-owned mobile drawer opens from the
 * menu button (or set {@link layoutPreview} in demos).
 *
 * @example
 * ```html
 * <aies-app-shell
 *   userName="Jane Doe"
 *   [userMenuItems]="accountMenu"
 *   [notifications]="notifications"
 *   [breadcrumbs]="crumbs"
 * >
 *   <aies-side-nav sidenav [items]="nav" [(collapsed)]="collapsed" />
 *   <router-outlet />
 * </aies-app-shell>
 * ```
 */
@Component({
  selector: 'aies-app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AiesIconComponent, AppShellHeaderComponent],
  host: {
    '[class]': 'hostClass()',
  },
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  protected readonly modeColor = inject(ModeColorService);
  protected readonly logoMiniUrl = inject(AIES_BRAND_LOGO_MINI_URL);

  private readonly customHeader = contentChild(AppShellHeaderSlotDirective);

  protected readonly mobileNavOpen = signal(false);

  /**
   * Max width of the content column. Defaults to `5xl` (same as the playground).
   * Use `full` for edge-to-edge dashboards.
   */
  readonly contentWidth = input<AppShellContentWidth>('5xl');

  /**
   * When true (default), draw a mode-accent hairline under the header.
   */
  readonly showAccent = input(true, { transform: booleanAttribute });

  /**
   * When true (default), render the built-in product header when no `[aiesAppShellHeader]`
   * slot is projected.
   */
  readonly showHeaderChrome = input(true, { transform: booleanAttribute });

  /**
   * Pin layout for demos/embeds. Production apps should omit this and rely on
   * viewport breakpoints.
   */
  readonly layoutPreview = input<AppShellLayoutPreview | null>(null);

  /** Built-in header title. */
  readonly headerTitle = input('');

  /** Built-in header breadcrumb trail. */
  readonly breadcrumbs = input<AiesNavItem[]>([]);

  /** Built-in header account name. */
  readonly userName = input<string | null>(null);

  /** Built-in header avatar image. */
  readonly userAvatarSrc = input<string | null>(null);

  /** Built-in header avatar menu entries. */
  readonly userMenuItems = input<AiesMenuItem[]>([]);

  /** Built-in header notification list. */
  readonly notifications = input<AiesNotification[]>([]);

  /** Built-in notification drawer title. */
  readonly notificationsTitle = input('Notifications');

  /** Built-in header clock visibility. */
  readonly showClock = input(true, { transform: booleanAttribute });

  /** Built-in header notification bell visibility. */
  readonly showNotifications = input(true, { transform: booleanAttribute });

  /** Built-in header clock date line format. */
  readonly clockDateFormat = input('EEE, MMM d, y');

  /** Built-in header clock time line format (seconds included by default). */
  readonly clockFormat = input('h:mm:ss a');

  protected readonly hasCustomHeader = computed(
    () => this.customHeader() != null,
  );

  /** Full height in preview embeds so absolute drawers stay inside the frame. */
  protected readonly hostClass = computed(() =>
    this.layoutPreview() ? 'block h-full' : 'block min-h-full',
  );

  protected readonly shellRootClass = computed(() =>
    this.layoutPreview()
      ? 'relative flex h-full min-h-0'
      : 'relative flex min-h-full',
  );

  protected readonly headerDensity = computed((): 'mobile' | 'tablet' | 'desktop' => {
    const preview = this.layoutPreview();
    if (preview === 'mobile') {
      return 'mobile';
    }
    if (preview === 'tablet') {
      return 'tablet';
    }
    return 'desktop';
  });

  protected readonly showMobileBar = computed(() => {
    const preview = this.layoutPreview();
    if (preview === 'mobile' || preview === 'tablet') {
      return true;
    }
    return preview !== 'desktop';
  });

  protected readonly sidenavHostClass = computed(() => {
    const preview = this.layoutPreview();
    const open = this.mobileNavOpen();

    // Preview embeds: absolute/h-full so the drawer stays inside the frame.
    // Production: h-dvh so the rail fills the viewport (h-full only matches parent).
    if (preview === 'desktop') {
      return 'z-50 shrink-0 self-start sticky top-0 block h-full';
    }

    if (preview === 'mobile' || preview === 'tablet') {
      return open
        ? 'z-50 shrink-0 self-start absolute inset-y-0 left-0 h-full shadow-xl'
        : 'hidden';
    }

    const base = 'z-50 shrink-0 self-start h-dvh';
    if (open) {
      return `${base} fixed inset-y-0 left-0 shadow-xl lg:sticky lg:top-0 lg:block`;
    }

    return `${base} hidden lg:sticky lg:top-0 lg:block`;
  });

  protected readonly mainClass = computed(() => {
    const width = this.contentWidth();
    const preview = this.layoutPreview();
    const pad =
      preview === 'mobile'
        ? 'flex-1 px-3 py-5'
        : 'flex-1 px-4 py-8 sm:px-6 sm:py-10';
    if (width === 'full') {
      return `w-full ${pad}`;
    }
    const max: Record<Exclude<AppShellContentWidth, 'full'>, string> = {
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
    };
    return `mx-auto w-full ${max[width]} ${pad}`;
  });

  protected toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => !open);
  }

  protected closeMobileNav(): void {
    this.mobileNavOpen.set(false);
  }
}
